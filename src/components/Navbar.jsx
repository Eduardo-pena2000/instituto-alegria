import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, CreditCard, Lock, User } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/niveles', label: 'Niveles' },
  { to: '/galeria', label: 'Instalaciones' },
  { to: '/admisiones', label: 'Admisiones' },
  { to: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [location])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#1e3166] ${scrolled ? 'shadow-2xl' : ''
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/logo.jpg"
              alt="Instituto Educativo Alegría Bilingüe"
              className="h-12 md:h-14 w-auto rounded-md"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${isActive
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* CTA + Admin + Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="hidden lg:flex items-center p-2 text-blue-300/30 hover:text-white/70 transition-colors rounded-lg"
              title="Admin"
            >
              <Lock className="w-4 h-4" />
            </Link>
            <Link
              to="/portal"
              className="hidden sm:flex items-center gap-1.5 text-blue-100 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <User className="w-4 h-4" />
              Portal Padres
            </Link>
            <Link
              to="/pago"
              className="hidden sm:flex items-center gap-2 bg-[#166534] hover:bg-[#15742f] text-white font-semibold text-sm py-2 px-4 rounded-xl transition-colors shadow-md"
            >
              <CreditCard className="w-4 h-4" />
              Pagar Colegiatura
            </Link>

            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Menú"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#162248] border-t border-white/10 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link
              to="/pago"
              className="flex items-center justify-center gap-2 bg-[#166534] hover:bg-[#15742f] text-white font-semibold text-sm py-3 px-4 rounded-xl w-full mt-3 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Pagar Colegiatura en Línea
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
