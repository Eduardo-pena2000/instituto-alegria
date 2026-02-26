import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle, FileText, Calendar, Users, Phone,
  Mail, ArrowRight, ChevronDown, ChevronUp, Download
} from 'lucide-react'

const steps = [
  {
    num: '01',
    title: 'Solicita información',
    desc: 'Contáctanos por teléfono, correo o visítanos. Te daremos toda la información sobre el proceso.',
    icon: Phone,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    num: '02',
    title: 'Entrega de documentos',
    desc: 'Reúne y entrega los documentos requeridos en dirección escolar.',
    icon: FileText,
    color: 'bg-purple-100 text-purple-700',
  },
  {
    num: '03',
    title: 'Entrevista familiar',
    desc: 'Una reunión con dirección para conocer a la familia y al estudiante.',
    icon: Users,
    color: 'bg-pink-100 text-pink-700',
  },
  {
    num: '04',
    title: 'Evaluación de diagnóstico',
    desc: 'Aplicamos una evaluación diagnóstica para conocer el nivel del alumno.',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700',
  },
  {
    num: '05',
    title: 'Confirmación de lugar',
    desc: 'Se notifica la aceptación y se aparta el lugar con el pago de inscripción.',
    icon: Calendar,
    color: 'bg-gold-100 text-gold-700',
  },
]

const docs = {
  preescolar: [
    'Acta de nacimiento (original y 2 copias)',
    'CURP del alumno',
    'Cartilla de vacunación actualizada',
    '2 fotografías tamaño infantil',
    'Comprobante de domicilio vigente',
    'Identificación oficial de ambos padres',
  ],
  primaria: [
    'Acta de nacimiento (original y 2 copias)',
    'CURP del alumno',
    'Boleta del ciclo escolar anterior',
    'Certificado de grado anterior (si aplica)',
    '4 fotografías tamaño infantil',
    'Comprobante de domicilio vigente',
    'Cartilla de vacunación',
    'Identificación oficial de ambos padres',
  ],
  secundaria: [
    'Acta de nacimiento (original y 2 copias)',
    'CURP del alumno',
    'Certificado de primaria',
    'Boleta del último ciclo',
    '4 fotografías tamaño infantil',
    'Comprobante de domicilio vigente',
    'Carta de buena conducta',
    'Identificación oficial de ambos padres',
  ],
}

const faqs = [
  {
    q: '¿Cuándo son las inscripciones?',
    a: 'Las inscripciones para el ciclo 2025-2026 están abiertas de enero a junio. Te recomendamos inscribirte temprano ya que los lugares son limitados.',
  },
  {
    q: '¿Tienen transporte escolar?',
    a: 'Sí, contamos con servicio de transporte escolar en diversas rutas. Consulta disponibilidad y costos en administración.',
  },
  {
    q: '¿Ofrecen becas?',
    a: 'Sí, contamos con un programa de becas por mérito académico y por necesidad económica. Solicita los requisitos en dirección.',
  },
  {
    q: '¿Cuánto cuesta la inscripción?',
    a: 'El costo de inscripción varía por nivel. Preescolar: $1,500 MXN, Primaria: $2,000 MXN, Secundaria: $2,500 MXN. Incluye materiales iniciales.',
  },
  {
    q: '¿Se puede visitar la escuela antes de inscribirse?',
    a: 'Por supuesto. Organizamos visitas guiadas los miércoles de 9:00 a 11:00 am. Agenda tu visita por teléfono o en línea.',
  },
  {
    q: '¿Cuáles son las formas de pago de colegiatura?',
    a: 'Aceptamos pago en efectivo en caja, transferencia bancaria y pago en línea con tarjeta de crédito o débito a través de nuestra plataforma digital.',
  },
]

export default function Admissions() {
  const [openFaq, setOpenFaq] = useState(null)
  const [activeDoc, setActiveDoc] = useState('primaria')
  const [formData, setFormData] = useState({
    parentName: '', childName: '', level: '', phone: '', email: '', message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = e => {
    e.preventDefault()
    // In production, send to backend
    setSubmitted(true)
  }

  return (
    <div className="pt-16 md:pt-20">

      {/* Hero */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0e1630 0%, #1e3166 55%, #0b2614 100%)' }}>
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#166534]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#166534] text-white text-xs font-bold px-5 py-2 rounded-full mb-6 uppercase tracking-widest">
            Ciclo 2025–2026 · Inscripciones abiertas
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Proceso de Admisión</h1>
          <div className="w-16 h-1 bg-[#166534] rounded-full mx-auto mb-4" />
          <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
            Acompañamos a tu familia en cada paso. ¡Es fácil y rápido!
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Pasos para inscribirse</h2>
            <p className="section-subtitle">Un proceso sencillo y transparente para darte la bienvenida.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map(({ num, title, desc, icon: Icon, color }, i) => (
              <div key={num} className="relative">
                <div className="card p-6 h-full text-center">
                  <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="text-3xl font-black text-gray-200 mb-2">{num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title">Documentos Requeridos</h2>
            <p className="section-subtitle">Documentación necesaria según el nivel educativo.</p>
          </div>

          {/* Level tabs */}
          <div className="flex gap-2 mb-6 justify-center">
            {['preescolar', 'primaria', 'secundaria'].map(l => (
              <button
                key={l}
                onClick={() => setActiveDoc(l)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                  activeDoc === l ? 'bg-primary-700 text-white' : 'bg-white text-gray-600 border hover:border-primary-300'
                }`}
              >
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>

          <div className="card p-6">
            <ul className="space-y-3">
              {docs[activeDoc].map((doc, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-gray-700">{doc}</span>
                </li>
              ))}
            </ul>
            <button className="mt-6 flex items-center gap-2 text-primary-700 font-semibold text-sm hover:text-primary-800 transition-colors">
              <Download className="w-4 h-4" />
              Descargar lista completa (PDF)
            </button>
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title">Calendario Escolar 2025-2026</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { month: 'Agosto 2025', event: 'Inicio de clases', color: 'border-blue-400' },
              { month: 'Sep – Nov 2025', event: 'Primer trimestre', color: 'border-green-400' },
              { month: 'Diciembre 2025', event: 'Vacaciones de invierno', color: 'border-gold-400' },
              { month: 'Ene – Mar 2026', event: 'Segundo trimestre', color: 'border-purple-400' },
              { month: 'Abril 2026', event: 'Vacaciones de primavera', color: 'border-pink-400' },
              { month: 'Abr – Jun 2026', event: 'Tercer trimestre y clausura', color: 'border-primary-400' },
            ].map(({ month, event, color }) => (
              <div key={month} className={`card p-4 border-l-4 ${color} flex items-center gap-4`}>
                <Calendar className="w-8 h-8 text-gray-400 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">{month}</p>
                  <p className="text-gray-500 text-sm">{event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title">Solicitar Información</h2>
            <p className="section-subtitle">Completa el formulario y nos comunicaremos contigo a la brevedad.</p>
          </div>

          {submitted ? (
            <div className="card p-10 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud recibida!</h3>
              <p className="text-gray-500">Nos comunicaremos contigo en menos de 24 horas. ¡Gracias por tu interés!</p>
              <Link to="/" className="btn-primary inline-block mt-6">Volver al inicio</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del padre/madre *</label>
                  <input
                    name="parentName" required value={formData.parentName} onChange={handleChange}
                    className="input-field" placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del alumno *</label>
                  <input
                    name="childName" required value={formData.childName} onChange={handleChange}
                    className="input-field" placeholder="Nombre del estudiante"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de interés *</label>
                <select
                  name="level" required value={formData.level} onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Selecciona un nivel</option>
                  <option value="preescolar">Preescolar (3-6 años)</option>
                  <option value="primaria">Primaria (6-12 años)</option>
                  <option value="secundaria">Secundaria (12-15 años)</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                  <input
                    type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                    className="input-field" placeholder="(123) 456-7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                  <input
                    type="email" name="email" required value={formData.email} onChange={handleChange}
                    className="input-field" placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje o preguntas</label>
                <textarea
                  name="message" rows={4} value={formData.message} onChange={handleChange}
                  className="input-field resize-none" placeholder="¿Tienes alguna pregunta o comentario adicional?"
                />
              </div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                Enviar solicitud <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title">Preguntas Frecuentes</h2>
          </div>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-gray-800 pr-4">{q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-5 h-5 text-primary-600 shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-gray-500 mb-4">¿Tienes más preguntas?</p>
            <Link to="/contacto" className="btn-outline">Contáctanos directamente</Link>
          </div>
        </div>
      </section>

    </div>
  )
}
