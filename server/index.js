/**
 * Instituto Educativo Alegría — Production API Server
 *
 * To run:
 *   cd server && npm install && npx prisma migrate dev && npm run seed && node index.js
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import Stripe from 'stripe'
import { config } from 'dotenv'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'

import { randomUUID } from 'crypto'
import cron from 'node-cron'
import authRoutes from './routes/auth.js'
import studentRoutes from './routes/students.js'
import paymentRoutes from './routes/payments.js'
import contactRoutes from './routes/contact.js'
import notificationRoutes from './routes/notifications.js'
import { checkAndSendReminders } from './jobs/tuitionReminders.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from project root (parent of server/)
config({ path: path.join(__dirname, '..', '.env') })

// ── Fail-fast: validate required env vars ──────────────────
const REQUIRED_ENV = ['STRIPE_SECRET_KEY', 'JWT_SECRET', 'DATABASE_URL']
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATAL: ${key} environment variable is not set`)
    process.exit(1)
  }
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('WARNING: STRIPE_WEBHOOK_SECRET not set — webhooks will fail signature verification')
}

const app = express()
const PORT = process.env.PORT || 3001
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const prisma = new PrismaClient()

// ── Security middleware ────────────────────────────────────
app.use(helmet())

// CORS — environment-driven origins
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173']

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}))

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' },
})

// ── Webhook route FIRST (needs raw body, before express.json) ──
const TUITION_AMOUNTS = {
  preescolar: 180000,
  primaria: 220000,
  secundaria: 250000,
}

app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('Webhook rejected: STRIPE_WEBHOOK_SECRET not configured')
    return res.status(500).json({ error: 'Webhook not configured' })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: 'Webhook verification failed' })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object
    console.log(`Pago exitoso: ${intent.metadata.studentName} — ${intent.amount / 100} MXN`)

    // Record payment in database
    const studentId = intent.metadata.studentId
    if (studentId) {
      prisma.student.findUnique({ where: { id: studentId } })
        .then(student => {
          if (!student) return
          const today = new Date().toISOString().split('T')[0]
          return Promise.all([
            prisma.payment.create({
              data: {
                studentId: student.id,
                studentName: `${student.nombre} ${student.apellido}`,
                nivel: student.nivel,
                amount: intent.amount / 100,
                date: today,
                folio: randomUUID().slice(0, 8).toUpperCase(),
                stripePaymentId: intent.id,
              },
            }),
            prisma.student.update({
              where: { id: studentId },
              data: { ultimoPago: today },
            }),
          ])
        })
        .catch(err => console.error('Webhook DB error:', err))
    }
  }

  res.json({ received: true })
})

// ── JSON parser for all other routes ───────────────────────
app.use(express.json({ limit: '1mb' }))

// Content-Type enforcement for mutation requests (CSRF protection)
app.use('/api/', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const ct = req.headers['content-type'] || ''
    if (!ct.includes('application/json')) {
      return res.status(400).json({ error: 'Content-Type must be application/json' })
    }
  }
  next()
})

// ── Rate limiters ──────────────────────────────────────────
app.use('/api/auth/', authLimiter)
app.use('/api/', apiLimiter)

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/notifications', notificationRoutes)

// Stripe PaymentIntent creation
const PaymentIntentSchema = z.object({
  level: z.enum(['preescolar', 'primaria', 'secundaria']),
  studentName: z.string().min(1).max(200),
  grade: z.string().max(50).optional().default(''),
  parentEmail: z.string().email().optional(),
  studentId: z.string().min(1),
})

app.post('/api/create-payment-intent', async (req, res) => {
  const parsed = PaymentIntentSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
  }

  const { level, studentName, grade, parentEmail, studentId } = parsed.data

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: TUITION_AMOUNTS[level],
      currency: 'mxn',
      metadata: {
        studentName,
        grade,
        level,
        studentId,
        concept: 'Colegiatura mensual',
      },
      receipt_email: parentEmail || undefined,
      description: `Colegiatura mensual — ${studentName} — ${grade} (${level})`,
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ error: 'Error procesando el pago. Intente de nuevo.' })
  }
})

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }))

// ── Serve frontend static build ──────────────────────────
const clientBuildPath = path.join(__dirname, '..', 'dist')
app.use(express.static(clientBuildPath))

// SPA fallback — any non-API route serves index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found' })
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'))
})

// ── WhatsApp reminder cron job ──────────────────────────────
if (process.env.TWILIO_ACCOUNT_SID) {
  cron.schedule('0 9 * * *', () => {
    console.log('Running scheduled tuition reminders...')
    checkAndSendReminders().catch(err => console.error('Cron reminder error:', err))
  })
  console.log('WhatsApp reminders cron scheduled (daily at 9:00 AM)')
} else {
  console.log('WhatsApp reminders disabled (TWILIO_ACCOUNT_SID not set)')
}

// ── Start server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nInstituto Alegria — API Server`)
  console.log(`Running on http://localhost:${PORT}`)
  console.log(`Endpoints:`)
  console.log(`  POST /api/auth/admin/login`)
  console.log(`  POST /api/auth/parent/login`)
  console.log(`  GET  /api/students`)
  console.log(`  GET  /api/students/search?q=`)
  console.log(`  POST /api/students`)
  console.log(`  POST /api/students/verify-curp`)
  console.log(`  POST /api/create-payment-intent`)
  console.log(`  GET  /api/payments`)
  console.log(`  POST /api/payments/record`)
  console.log(`  POST /api/contact`)
  console.log(`  POST /api/webhook`)
  console.log(`  GET  /api/notifications`)
  console.log(`  POST /api/notifications/send-now`)
  console.log(`  GET  /api/health\n`)
})
