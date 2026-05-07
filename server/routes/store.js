import { Router } from 'express'
import Stripe from 'stripe'
import { z } from 'zod'
import { authenticateAdmin } from '../middleware/auth.js'
import { STORE_PRODUCTS } from '../../src/utils/storeData.js'

const router = Router()
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

const CartItemSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(200),
    price: z.number().positive(),
    qty: z.number().int().min(1),
    selectedSize: z.string().max(20).nullable().optional(),
})

const StoreCheckoutSchema = z.object({
    items: z.array(CartItemSchema).min(1).max(50),
    studentName: z.string().min(1).max(200),
    studentId: z.string().max(100).optional().default(''),
    receiptEmail: z.string().email().max(200).optional(),
})

// POST /api/store/create-payment-intent
router.post('/create-payment-intent', async (req, res) => {
    if (!stripe) {
        return res.status(503).json({ error: 'Stripe no está configurado. Agrega STRIPE_SECRET_KEY al .env' })
    }

    const parsed = StoreCheckoutSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ error: 'Datos del carrito inválidos', details: parsed.error.flatten() })
    }

    const { items, studentName, studentId, receiptEmail } = parsed.data

    // Find real prices from server-side STORE_PRODUCTS
    const getProductPrice = (productId) => {
        for (const level of Object.values(STORE_PRODUCTS)) {
            for (const category of Object.values(level)) {
                for (const product of category) {
                    if (product.id === productId) return product.price
                }
            }
        }
        return null
    }

    // Calculate total on the server using verified prices
    let totalCents = 0
    const verifiedItems = []

    for (const item of items) {
        const realPrice = getProductPrice(item.id)
        if (realPrice === null) {
            return res.status(400).json({ error: `Producto no encontrado: ${item.name}` })
        }
        totalCents += Math.round(realPrice * 100) * item.qty
        // Use real price for metadata
        verifiedItems.push(`${item.name}${item.selectedSize ? ` (${item.selectedSize})` : ''} ×${item.qty}`)
    }

    if (totalCents < 1000) { // Minimum $10 MXN
        return res.status(400).json({ error: 'El monto mínimo de compra es $10 MXN' })
    }

    const itemsSummary = verifiedItems.join(', ')

    // Idempotency key to safely handle double clicks (per-minute window + random suffix)
    const idempotencyKey = `store-${studentId || 'anon'}-${totalCents}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalCents,
            currency: 'mxn',
            ...(receiptEmail && { receipt_email: receiptEmail }),
            metadata: {
                type: 'store_purchase',
                studentName,
                studentId: studentId || '',
                items: itemsSummary.slice(0, 500), // Stripe metadata limit
                itemCount: items.length.toString(),
            },
            description: `Tienda Escolar — ${studentName} — ${items.length} artículo(s)`,
        }, {
            idempotencyKey
        })

        res.json({
            clientSecret: paymentIntent.client_secret,
            totalCents,
        })
    } catch (err) {
        console.error('Store Stripe error:', err)
        res.status(500).json({ error: 'Error al crear la sesión de pago. Intenta de nuevo.' })
    }
})

// POST /api/store/record-order
router.post('/record-order', async (req, res) => {
    try {
        const { studentId, items, totalCents, stripePaymentId } = req.body

        if (!studentId || !items || !totalCents || !stripePaymentId) {
            return res.status(400).json({ error: 'Faltan datos requeridos (studentId, items, totalCents, stripePaymentId)' })
        }

        // Verify with Stripe that the payment succeeded and matches the order
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentId)
            
            if (paymentIntent.status !== 'succeeded') {
                return res.status(400).json({ error: 'El pago no ha sido completado en Stripe' })
            }

            // Verify the PaymentIntent is actually for a store purchase
            if (paymentIntent.metadata.type !== 'store_purchase') {
                return res.status(400).json({ error: 'El pago proporcionado no es válido para la tienda' })
            }

            // Verify the amount matches what we expect
            if (paymentIntent.amount !== totalCents) {
                return res.status(400).json({ error: 'El monto del pago no coincide con el total del pedido' })
            }

            // Verify the payment belongs to this student
            if (paymentIntent.metadata.studentId !== (studentId || '')) {
                return res.status(400).json({ error: 'El pago no corresponde a este alumno' })
            }
        } catch (stripeErr) {
            console.error('Stripe verification error:', stripeErr.message)
            return res.status(400).json({ error: 'No se pudo verificar el pago con Stripe' })
        }

        // Check if order was already recorded
        const { default: prisma } = await import('../lib/prisma.js');
        const existing = await prisma.storeOrder.findUnique({
            where: { stripePaymentId }
        })

        if (existing) {
            return res.json(existing)
        }

        const student = await prisma.student.findUnique({ where: { id: studentId } })
        if (!student) {
            return res.status(404).json({ error: 'Alumno no encontrado' })
        }

        const today = new Date().toISOString().split('T')[0]

        // Record the order
        const order = await prisma.storeOrder.create({
            data: {
                studentId: student.id,
                studentName: `${student.nombre} ${student.apellido}`,
                items,
                totalCents,
                status: 'pending',
                stripePaymentId,
                date: today,
            }
        })

        res.status(201).json(order)
    } catch (err) {
        console.error('Record store order error:', err)
        res.status(500).json({ error: 'Error al registrar el pedido' })
    }
})

// GET /api/store/orders - Admin only
router.get('/orders', authenticateAdmin, async (req, res) => {
    try {
        const { default: prisma } = await import('../lib/prisma.js');
        const orders = await prisma.storeOrder.findMany({
            orderBy: { createdAt: 'desc' }
        })
        res.json(orders)
    } catch (err) {
        console.error('Get store orders error:', err)
        res.status(500).json({ error: 'Error al obtener los pedidos' })
    }
})

// PUT /api/store/orders/:id/status - Admin only
router.put('/orders/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { status } = req.body
        if (!['pending', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Estado inválido' })
        }

        const { default: prisma } = await import('../lib/prisma.js');
        const order = await prisma.storeOrder.update({
            where: { id: req.params.id },
            data: { status }
        })
        res.json(order)
    } catch (err) {
        console.error('Update store order error:', err)
        res.status(500).json({ error: 'Error al actualizar el pedido' })
    }
})

export default router
