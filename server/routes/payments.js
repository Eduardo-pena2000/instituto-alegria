import { Router } from 'express'
import { randomUUID } from 'crypto'
import Stripe from 'stripe'
import prisma from '../lib/prisma.js'
import { TUITION } from '../shared/tuition.js'
import { authenticateAdmin, authenticateAny } from '../middleware/auth.js'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

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
router.get('/student/:studentId', authenticateAny, async (req, res) => {
  try {
    // Parents can only see their own student's payments
    if (req.user.role === 'parent' && req.user.studentId !== req.params.studentId) {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    const [payments, storeOrders] = await Promise.all([
      prisma.payment.findMany({
        where: { studentId: req.params.studentId },
      }),
      prisma.storeOrder.findMany({
        where: { studentId: req.params.studentId },
      })
    ])

    // Normalize tuition payments
    const normalizedPayments = payments.map(p => ({
      ...p,
      type: 'tuition',
      title: 'Pago de Colegiatura',
      displayAmount: p.amount,
      createdAtStr: p.createdAt.toISOString()
    }))

    // Normalize store orders
    const normalizedStoreOrders = storeOrders.map(o => ({
      ...o,
      type: 'store',
      title: 'Compra en Tienda Escolar',
      folio: o.id.slice(0, 8).toUpperCase(), // Use shorter ID for display
      displayAmount: o.totalCents / 100,
      createdAtStr: o.createdAt.toISOString()
    }))

    // Merge and sort descending
    const merged = [...normalizedPayments, ...normalizedStoreOrders]
      .sort((a, b) => b.createdAtStr.localeCompare(a.createdAtStr))

    res.json(merged)
  } catch (err) {
    console.error('Get student payments error:', err)
    res.status(500).json({ error: 'Error al obtener pagos' })
  }
})

// POST /api/payments/record — called after successful Stripe payment
router.post('/record', async (req, res) => {
  try {
    const { studentId, stripePaymentId } = req.body
    if (!studentId) {
      return res.status(400).json({ error: 'studentId es requerido' })
    }
    if (!stripePaymentId) {
      return res.status(400).json({ error: 'stripePaymentId es requerido' })
    }

    // Verify the payment actually succeeded in Stripe to prevent fake requests
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentId)
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'El pago no ha sido completado en Stripe' })
      }

      // Verify the payment is actually for tuition
      if (paymentIntent.metadata.concept !== 'Colegiatura mensual') {
        return res.status(400).json({ error: 'El pago proporcionado no es válido para colegiatura' })
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

// POST /api/payments/admin-record — admin registers a cash/manual payment (no Stripe)
router.post('/admin-record', authenticateAdmin, async (req, res) => {
  try {
    const { studentId } = req.body
    if (!studentId) {
      return res.status(400).json({ error: 'studentId es requerido' })
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
        stripePaymentId: null,
      },
    })

    await prisma.student.update({
      where: { id: studentId },
      data: { ultimoPago: today },
    })

    res.status(201).json(payment)
  } catch (err) {
    console.error('Admin record payment error:', err)
    res.status(500).json({ error: 'Error al registrar pago' })
  }
})

export default router
