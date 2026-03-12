import twilio from 'twilio'
import { TUITION } from '../shared/tuition.js'
import { fmtDate } from '../shared/helpers.js'

let client = null

function getClient() {
  if (!client) {
    const sid = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN
    if (!sid || !token) return null
    client = twilio(sid, token)
  }
  return client
}

function buildMessage(student, status) {
  const amount = TUITION[student.nivel] || 0
  const urgency = status.type === 'vencida'
    ? 'se encuentra *VENCIDA*'
    : 'está *POR VENCER*'

  return [
    'Estimado(a) padre/madre de familia,',
    '',
    `Le informamos que la colegiatura de *${student.nombre} ${student.apellido}* (${student.nivel} ${student.grado}) ${urgency}.`,
    '',
    `Monto: *$${amount.toLocaleString()} MXN*`,
    `Último pago: ${fmtDate(student.ultimoPago)}`,
    '',
    'Puede realizar su pago en línea en nuestra página web.',
    '',
    'Instituto Educativo Alegría',
  ].join('\n')
}

async function sendWhatsAppReminder(student, type) {
  const twilioClient = getClient()
  if (!twilioClient) {
    return { success: false, messageSid: null, error: 'Twilio not configured' }
  }

  const from = process.env.TWILIO_WHATSAPP_FROM
  if (!from) {
    return { success: false, messageSid: null, error: 'TWILIO_WHATSAPP_FROM not set' }
  }

  const phone = student.telefono.replace(/\D/g, '')
  if (!phone || phone.length < 10) {
    return { success: false, messageSid: null, error: `Invalid phone: ${student.telefono}` }
  }

  const status = { type, label: type === 'vencida' ? 'VENCIDA' : 'POR VENCER' }
  const body = buildMessage(student, status)

  try {
    const message = await twilioClient.messages.create({
      from,
      to: `whatsapp:+52${phone}`,
      body,
    })
    return { success: true, messageSid: message.sid, error: null }
  } catch (err) {
    console.error(`WhatsApp send failed for ${student.nombre} ${student.apellido}:`, err.message)
    return { success: false, messageSid: null, error: err.message }
  }
}

export { sendWhatsAppReminder }
