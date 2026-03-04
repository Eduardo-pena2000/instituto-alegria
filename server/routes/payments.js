import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import Stripe from 'stripe'
import { authenticateAdmin, authenticateParent } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const TUITION = {
  preescolar: 1800,
  primaria: 2200,
  secundaria: 2500,
}

// GET /api/payments — admin only
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    res.json(payments)
  } catch (err) {
    console.error('Get payments error:', err)
    res.status(500).json({ error: 'Error al obtener pagos' })
  }
})

// GET /api/payments/student/:studentId — parent (own student only)
router.get('/student/:studentId', authenticateParent, async (req, res) => {
  try {
    if (req.user.studentId !== req.params.studentId) {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    const payments = await prisma.payment.findMany({
      where: { studentId: req.params.studentId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(payments)
  } catch (err) {
    console.error('Get student payments error:', err)
    res.status(500).json({ error: 'Error al obtener pagos' })
  }
})

// POST /api/payments/record — called after successful Stripe payment
// Requires a valid stripePaymentId to prevent fake payment creation
router.post('/record', async (req, res) => {
  try {
    const { studentId, stripePaymentId } = req.body
    if (!studentId) {
      return res.status(400).json({ error: 'studentId es requerido' })
    }
    if (!stripePaymentId) {
      return res.status(400).json({ error: 'stripePaymentId es requerido' })
    }

    // Verify the payment actually succeeded in Stripe
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentId)
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'El pago no ha sido completado en Stripe' })
      }
    } catch (stripeErr) {
      console.error('Stripe verification error:', stripeErr.message)
      return res.status(400).json({ error: 'No se pudo verificar el pago con Stripe' })
    }

    // Check for duplicate payment recording
    const existing = await prisma.payment.findFirst({
      where: { stripePaymentId },
    })
    if (existing) {
      return res.json(existing) // Already recorded, return the existing one
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } })
    if (!student) {
      return res.status(404).json({ error: 'Alumno no encontrado' })
    }

    const today = new Date().toISOString().split('T')[0]
    const folio = randomUUID().slice(0, 8).toUpperCase()

    const payment = await prisma.payment.create({
      data: {
        studentId: student.id,
        studentName: `${student.nombre} ${student.apellido}`,
        nivel: student.nivel,
        amount: TUITION[student.nivel] || 0,
        date: today,
        folio,
        stripePaymentId: stripePaymentId || null,
      },
    })

    // Update student's last payment date
    await prisma.student.update({
      where: { id: studentId },
      data: { ultimoPago: today },
    })

    res.status(201).json(payment)
  } catch (err) {
    console.error('Record payment error:', err)
    res.status(500).json({ error: 'Error al registrar pago' })
  }
})

export default router
