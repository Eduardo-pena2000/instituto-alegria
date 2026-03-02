import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(100),
  phone: z.string().max(30).optional().default(''),
  subject: z.string().min(1).max(100),
  message: z.string().min(1).max(2000),
})

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const parsed = ContactSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
    }

    await prisma.contactMessage.create({ data: parsed.data })
    res.status(201).json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    res.status(500).json({ error: 'Error al enviar mensaje' })
  }
})

export default router
