import prisma from '../lib/prisma.js'
import { sendWhatsAppReminder } from '../services/whatsapp.js'
import { getTuitionStatus } from '../shared/helpers.js'

export async function checkAndSendReminders() {
  console.log(`[${new Date().toISOString()}] Checking tuition reminders...`)

  const students = await prisma.student.findMany()
  let sent = 0
  let failed = 0
  let skipped = 0

  for (const student of students) {
    const status = getTuitionStatus(student.ultimoPago)

    // Only notify for por_vencer or vencida
    if (status.type === 'vigente') continue

    // Check if we already sent this type of notification in the last 24h
    const recentNotification = await prisma.whatsAppNotification.findFirst({
      where: {
        studentId: student.id,
        type: status.type,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    })

    if (recentNotification) {
      skipped++
      continue
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
      sent++
    } else {
      failed++
    }
  }

  const summary = `Reminders complete: ${sent} sent, ${failed} failed, ${skipped} skipped (already notified)`
  console.log(`[${new Date().toISOString()}] ${summary}`)
  return { sent, failed, skipped }
}
