import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticateAdmin } from '../middleware/auth.js'
import { sendWhatsAppReminder } from '../services/whatsapp.js'
import { getTuitionStatus } from '../shared/helpers.js'
import { checkAndSendReminders } from '../jobs/tuitionReminders.js'

const router = Router()

// All routes require admin auth
router.use(authenticateAdmin)

// GET /api/notifications — last 50 notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await prisma.whatsAppNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        student: { select: { nombre: true, apellido: true, nivel: true, grado: true } },
      },
    })
    res.json(notifications)
  } catch (err) {
    console.error('Error fetching notifications:', err)
    res.status(500).json({ error: 'Error al obtener notificaciones' })
  }
})

// GET /api/notifications/pending — students needing a reminder now
router.get('/pending', async (req, res) => {
  try {
    const students = await prisma.student.findMany()
    const pending = []

    for (const student of students) {
      const status = getTuitionStatus(student.ultimoPago)
      if (status.type === 'vigente') continue

      const recentNotification = await prisma.whatsAppNotification.findFirst({
        where: {
          studentId: student.id,
          type: status.type,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      })

      pending.push({
        student: {
          id: student.id,
          nombre: student.nombre,
          apellido: student.apellido,
          nivel: student.nivel,
          grado: student.grado,
          telefono: student.telefono,
          ultimoPago: student.ultimoPago,
        },
        type: status.type,
        label: status.label,
        alreadyNotified: !!recentNotification,
      })
    }

    res.json(pending)
  } catch (err) {
    console.error('Error fetching pending notifications:', err)
    res.status(500).json({ error: 'Error al obtener pendientes' })
  }
})

// POST /api/notifications/send-now — trigger all reminders manually
router.post('/send-now', async (req, res) => {
  try {
    const result = await checkAndSendReminders()
    res.json({ message: 'Recordatorios procesados', ...result })
  } catch (err) {
    console.error('Error sending reminders:', err)
    res.status(500).json({ error: 'Error al enviar recordatorios' })
  }
})

// POST /api/notifications/send/:studentId — send reminder to specific student
router.post('/send/:studentId', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.studentId } })
    if (!student) {
      return res.status(404).json({ error: 'Alumno no encontrado' })
    }

    const status = getTuitionStatus(student.ultimoPago)
    if (status.type === 'vigente') {
      return res.status(400).json({ error: 'La colegiatura de este alumno está vigente' })
    }

    const result = await sendWhatsAppReminder(student, status.type)

    await prisma.whatsAppNotification.create({
      data: {
        studentId: student.id,
        type: status.type,
        phone: student.telefono,
        messageSid: result.messageSid,
        status: result.success ? 'sent' : 'failed',
        error: result.error,
      },
    })

    if (result.success) {
      res.json({ message: 'Recordatorio enviado', messageSid: result.messageSid })
    } else {
      res.status(500).json({ error: `Error al enviar: ${result.error}` })
    }
  } catch (err) {
    console.error('Error sending individual reminder:', err)
    res.status(500).json({ error: 'Error al enviar recordatorio' })
  }
})

export default router
