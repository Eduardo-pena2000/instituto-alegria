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
import prisma from './lib/prisma.js'
import { getCurrentTuitionCents } from './shared/tuition.js'
import path from 'path'
import { fileURLToPath } from 'url'

import { randomUUID } from 'crypto'
import cron from 'node-cron'
import authRoutes from './routes/auth.js'
import studentRoutes from './routes/students.js'
import paymentRoutes from './routes/payments.js'
import contactRoutes from './routes/contact.js'
import notificationRoutes from './routes/notifications.js'
import storeRoutes from './routes/store.js'
import { checkAndSendReminders } from './jobs/tuitionReminders.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from project root (parent of server/)
config({ path: path.join(__dirname, '..', '.env') })

// ── Fail-fast: validate required env vars ──────────────────
const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL']
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATAL: ${key} environment variable is not set`)
    process.exit(1)
  }
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('WARNING: STRIPE_SECRET_KEY not set — payment endpoints will not work')
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('WARNING: STRIPE_WEBHOOK_SECRET not set — webhooks will fail signature verification')
}

const app = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT || 3001
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

// ── Security middleware ────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.stripe.com", "*"], // Allow external images
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Needed for external images in some cases
}))

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

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas búsquedas. Intenta de nuevo en un minuto.' },
})

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados mensajes enviados. Intenta de nuevo más tarde.' },
})

// ── Webhook route FIRST (needs raw body, before express.json) ──

app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe no configurado' })
  }
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
    
    // Only process tuition payments here. Store purchases are handled by the store routes.
    if (intent.metadata.concept === 'Colegiatura mensual') {
      console.log(`Pago de colegiatura exitoso: ${intent.metadata.studentName} — ${intent.amount / 100} MXN`)

      // Record payment in database
      const studentId = intent.metadata.studentId
      if (studentId) {
        prisma.student.findUnique({ where: { id: studentId } })
          .then(async student => {
            if (!student) return

            // Prevent duplicate records if frontend /record hit first
            const existing = await prisma.payment.findFirst({
              where: { stripePaymentId: intent.id }
            })
            if (existing) {
               console.log(`Webhook: Pago de colegiatura ya registrado (stripePaymentId: ${intent.id})`)
               return
            }

            const today = new Date().toISOString().split('T')[0]
            await prisma.$transaction([
              prisma.payment.create({
                data: {
                  studentId: student.id,
                  studentName: `${student.nombre} ${student.apellido}`,
                  nivel: student.nivel,
                  amount: Math.round(intent.amount / 100),
                  date: today,
                  folio: randomUUID().slice(0, 12).toUpperCase(),
                  stripePaymentId: intent.id,
                },
              }),
              prisma.student.update({
                where: { id: studentId },
                data: { ultimoPago: today },
              }),
            ])
            console.log(`Webhook: Pago de colegiatura registrado exitosamente`)
          })
          .catch(err => {
            if (err.code === 'P2002') {
              console.log(`Webhook: Pago de colegiatura duplicado evitado por restricción única (stripePaymentId: ${intent.id})`)
            } else {
              console.error('Webhook DB error:', err)
            }
          })
      }
    } else if (intent.metadata.type === 'store_purchase') {
       // We can optionally handle store purchases here in the future if needed,
       // but for now the frontend `/record-order` handles it reliably.
       console.log(`Webhook: Compra de tienda ignorada (manejada por /record-order): ${intent.id}`)
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
app.use('/api/students/search', searchLimiter)
app.use('/api/contact/', contactLimiter)
app.use('/api/', apiLimiter)

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/store', storeRoutes)

// Stripe PaymentIntent creation
const PaymentIntentSchema = z.object({
  level: z.enum(['preescolar', 'primaria', 'secundaria']),
  studentName: z.string().min(1).max(200),
  grade: z.string().max(50).optional().default(''),
  parentEmail: z.string().email().optional(),
  studentId: z.string().min(1),
})

app.post('/api/create-payment-intent', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe no está configurado. Agrega STRIPE_SECRET_KEY al .env' })
  }

  const parsed = PaymentIntentSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
  }

  const { studentName, grade, parentEmail, studentId } = parsed.data

  try {
    const student = await prisma.student.findUnique({ where: { id: studentId } })
    if (!student) {
      return res.status(404).json({ error: 'Alumno no encontrado' })
    }

    const realLevel = student.nivel

    // Generate an idempotency key to prevent double charges if the user double-clicks
    const cents = getCurrentTuitionCents(realLevel)
    const idempotencyKey = `${studentId}-${cents}-${new Date().toISOString().slice(0, 13)}`

    const paymentIntent = await stripe.paymentIntents.create({
      amount: cents,
      currency: 'mxn',
      metadata: {
        studentName,
        grade,
        level: realLevel,
        studentId,
        concept: 'Colegiatura mensual',
      },
      receipt_email: parentEmail || undefined,
      description: `Colegiatura mensual — ${studentName} — ${grade} (${realLevel})`,
    }, {
      idempotencyKey
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

// ── Global error handler ────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.stack || err)
  res.status(500).json({ error: 'Error interno del servidor' })
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
  console.log(`  POST /api/payments/record (auth)`)
  console.log(`  POST /api/payments/admin-record (admin)`)
  console.log(`  POST /api/contact`)
  console.log(`  POST /api/webhook`)
  console.log(`  GET  /api/notifications`)
  console.log(`  POST /api/notifications/send-now`)
  console.log(`  GET  /api/health\n`)
})
