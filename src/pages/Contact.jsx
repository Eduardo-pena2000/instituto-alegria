import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Facebook, Send, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = e => {
    e.preventDefault()
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
            IEA · "Valores para VIVIR"
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Contáctanos</h1>
          <div className="w-16 h-1 bg-[#166534] rounded-full mx-auto mb-4" />
          <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
            Estamos aquí para responder todas tus preguntas. Nos encanta escucharte.
          </p>
        </div>
      </section>

      {/* Contact section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Información de contacto</h2>

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dirección</h3>
                    <p className="text-gray-500 mt-0.5">Calle Principal #123, Col. Centro</p>
                    <p className="text-gray-500">C.P. 00000, México</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-primary-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Teléfono</h3>
                    <a href="tel:+521234567890" className="text-primary-600 hover:text-primary-700 transition-colors mt-0.5 block">
                      (123) 456-7890
                    </a>
                    <a href="tel:+521234567891" className="text-primary-600 hover:text-primary-700 transition-colors block">
                      (123) 456-7891
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Correo electrónico</h3>
                    <a href="mailto:info@institutoalegria.edu.mx" className="text-primary-600 hover:text-primary-700 transition-colors mt-0.5 block">
                      info@institutoalegria.edu.mx
                    </a>
                    <a href="mailto:admisiones@institutoalegria.edu.mx" className="text-primary-600 hover:text-primary-700 transition-colors block">
                      admisiones@institutoalegria.edu.mx
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-primary-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Horario de atención</h3>
                    <p className="text-gray-500 mt-0.5">Lunes a Viernes: 7:30 am – 3:00 pm</p>
                    <p className="text-gray-500">Sábado: 9:00 am – 12:00 pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Facebook className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Redes sociales</h3>
                    <a
                      href="https://www.facebook.com/InstitutoEducativoAlegria"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 transition-colors mt-0.5 block"
                    >
                      Instituto Educativo Alegría
                    </a>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="rounded-2xl overflow-hidden shadow-lg h-64 bg-gray-200 relative">
                <iframe
                  title="Ubicación Instituto Educativo Alegría"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120000!2d-99.1332!3d19.4326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1f92d8f5be741%3A0x9c698b4b5f4a4a4a!2sCiudad%20de%20M%C3%A9xico%2C%20CDMX!5e0!3m2!1ses!2smx!4v1234567890"
                  className="w-full h-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Envíanos un mensaje</h2>

              {submitted ? (
                <div className="card p-10 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Mensaje enviado!</h3>
                  <p className="text-gray-500 mb-6">Gracias por contactarnos. Te responderemos en menos de 24 horas.</p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                    className="btn-outline"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card p-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                      <input
                        type="text" name="name" required value={formData.name} onChange={handleChange}
                        className="input-field" placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        className="input-field" placeholder="(123) 456-7890"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                    <input
                      type="email" name="email" required value={formData.email} onChange={handleChange}
                      className="input-field" placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asunto *</label>
                    <select
                      name="subject" required value={formData.subject} onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Selecciona un tema</option>
                      <option value="admisiones">Información sobre admisiones</option>
                      <option value="colegiaturas">Colegiaturas y pagos</option>
                      <option value="academico">Asunto académico</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje *</label>
                    <textarea
                      name="message" rows={5} required value={formData.message} onChange={handleChange}
                      className="input-field resize-none" placeholder="Escribe tu mensaje aquí..."
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Enviar mensaje
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
