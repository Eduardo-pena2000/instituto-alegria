import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Facebook, Clock } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-primary-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="mb-4">
              <img
                src="/logo.jpg"
                alt="Instituto Educativo Alegría Bilingüe"
                className="h-20 w-auto rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Formando estudiantes con valores, conocimiento y alegría desde hace más de 20 años.
              <span className="block mt-1 text-gold-300 font-medium italic">"Valores para VIVIR"</span>
            </p>
            <a
              href="https://www.facebook.com/InstitutoEducativoAlegria"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              <Facebook className="w-4 h-4" />
              Síguenos en Facebook
            </a>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-base">Navegación</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Inicio' },
                { to: '/nosotros', label: 'Nosotros' },
                { to: '/niveles', label: 'Niveles Educativos' },
                { to: '/galeria', label: 'Instalaciones' },
                { to: '/admisiones', label: 'Admisiones' },
                { to: '/pago', label: 'Pagar Colegiatura' },
                { to: '/contacto', label: 'Contacto' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Levels */}
          <div>
            <h3 className="font-bold text-white mb-4 text-base">Niveles Educativos</h3>
            <ul className="space-y-3">
              <li>
                <p className="text-sm font-medium text-gray-200">Preescolar</p>
                <p className="text-xs text-gray-500">3 a 6 años</p>
              </li>
              <li>
                <p className="text-sm font-medium text-gray-200">Primaria</p>
                <p className="text-xs text-gray-500">6 a 12 años · 1° a 6° grado</p>
              </li>
              <li>
                <p className="text-sm font-medium text-gray-200">Secundaria</p>
                <p className="text-xs text-gray-500">12 a 15 años · 1° a 3° grado</p>
              </li>
            </ul>

            <div className="mt-6">
              <h3 className="font-bold text-white mb-3 text-base">Horarios</h3>
              <div className="flex items-start gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                <div>
                  <p>Lunes a Viernes</p>
                  <p>7:30 am – 2:30 pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4 text-base">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                <span>Calle Principal #123, Col. Centro, México</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <a href="tel:+521234567890" className="hover:text-white transition-colors">
                  (123) 456-7890
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a href="mailto:info@institutoalegria.edu.mx" className="hover:text-white transition-colors">
                  info@institutoalegria.edu.mx
                </a>
              </li>
            </ul>

            <Link
              to="/pago"
              className="mt-6 inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-colors"
            >
              Pagar Colegiatura
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {year} Instituto Educativo Alegría. Todos los derechos reservados.</p>
          <p>Diseñado con ❤️ para el aprendizaje</p>
        </div>
      </div>
    </footer>
  )
}
