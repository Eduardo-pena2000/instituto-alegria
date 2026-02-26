/**
 * Instituto Educativo Alegría — Stripe Payment Backend
 *
 * To run:
 *   cd server && npm install && node index.js
 *
 * Environment variables (create server/.env):
 *   STRIPE_SECRET_KEY=sk_live_...
 *   PORT=3001
 */

import express from 'express'
import cors from 'cors'
import Stripe from 'stripe'
import { config } from 'dotenv'

config()

const app = express()
const PORT = process.env.PORT || 3001

// ⚠️  Replace with your real Stripe secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY')

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json())

// Colegiatura amounts in centavos (MXN)
const TUITION_AMOUNTS = {
  preescolar: 180000,
  primaria:   220000,
  secundaria: 250000,
}

/**
 * POST /api/create-payment-intent
 * Creates a Stripe PaymentIntent for colegiatura payment
 */
app.post('/api/create-payment-intent', async (req, res) => {
  const { level, studentName, grade, parentEmail } = req.body

  if (!level || !TUITION_AMOUNTS[level]) {
    return res.status(400).json({ error: 'Nivel educativo inválido' })
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: TUITION_AMOUNTS[level],
      currency: 'mxn',
      metadata: {
        studentName: studentName || '',
        grade: grade || '',
        level,
        concept: 'Colegiatura mensual',
      },
      receipt_email: parentEmail || undefined,
      description: `Colegiatura mensual — ${studentName} — ${grade} (${level})`,
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/webhook
 * Stripe webhook for payment confirmation (configure in Stripe dashboard)
 */
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object
    console.log(`✅ Pago exitoso: ${intent.metadata.studentName} — ${intent.amount / 100} MXN`)
    // TODO: send confirmation email, update database, etc.
  }

  res.json({ received: true })
})

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }))

app.listen(PORT, () => {
  console.log(`\n🏫 Instituto Alegría — API Server`)
  console.log(`✅ Corriendo en http://localhost:${PORT}`)
  console.log(`📋 Endpoints:`)
  console.log(`   POST /api/create-payment-intent`)
  console.log(`   POST /api/webhook`)
  console.log(`   GET  /api/health\n`)
})
