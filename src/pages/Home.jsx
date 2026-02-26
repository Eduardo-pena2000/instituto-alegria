import { Link } from 'react-router-dom'
import {
  GraduationCap, Users, Award, BookOpen, Star,
  ChevronRight, CreditCard, Phone, ArrowRight,
  CheckCircle, Heart, Target, Sparkles
} from 'lucide-react'

const stats = [
  { icon: GraduationCap, value: '20+', label: 'Años de experiencia' },
  { icon: Users, value: '600+', label: 'Alumnos activos' },
  { icon: Award, value: '98%', label: 'Índice de aprobación' },
  { icon: BookOpen, value: '3', label: 'Niveles educativos' },
]

const levels = [
  {
    title: 'Preescolar',
    ages: '3 – 6 años',
    desc: 'Desarrollo integral a través del juego, la creatividad y la exploración. Preparamos a los pequeños para una vida de aprendizaje.',
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
  },
  {
    title: 'Primaria',
    ages: '6 – 12 años',
    desc: 'Formación académica sólida en un ambiente motivador. Fomentamos el pensamiento crítico y el amor por el conocimiento.',
    img: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&q=80',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    title: 'Secundaria',
    ages: '12 – 15 años',
    desc: 'Preparamos adolescentes para los retos del futuro con una educación integral, valores y habilidades para la vida.',
    img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80',
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
]

const testimonials = [
  {
    name: 'María González',
    role: 'Madre de familia',
    text: 'El Instituto Alegría ha sido la mejor decisión para mis hijos. Los maestros son dedicados y el ambiente es muy positivo.',
    rating: 5,
  },
  {
    name: 'Carlos Ramírez',
    role: 'Padre de familia',
    text: 'Mis hijos han crecido mucho académica y personalmente. El nivel de enseñanza es excelente y la comunicación con los padres es constante.',
    rating: 5,
  },
  {
    name: 'Ana Martínez',
    role: 'Exalumna',
    text: 'Guardo los mejores recuerdos de mi tiempo en el Instituto. Me formaron no solo académicamente sino también como persona.',
    rating: 5,
  },
]

const values = [
  { icon: Heart, title: 'Amor por la educación', desc: 'Enseñamos con pasión y dedicación.' },
  { icon: Target, title: 'Excelencia académica', desc: 'Altos estándares de calidad educativa.' },
  { icon: Sparkles, title: 'Desarrollo integral', desc: 'Formamos en valores y habilidades.' },
  { icon: Users, title: 'Comunidad unida', desc: 'Familia educativa comprometida.' },
]

export default function Home() {
  return (
    <div className="pt-16 md:pt-20">

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Fondo fotográfico */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80')" }}
        />
        {/* Degradado diagonal marino → verde forestal (colores del logo) */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(8,14,28,0.97) 0%, rgba(30,49,102,0.90) 50%, rgba(11,38,20,0.85) 100%)' }}
        />

        {/* Barra izquierda verde forestal (acento del logo) */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#166534]" />

        {/* Patrón de puntos sutil */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }}
        />

        <div className="relative max-w-7xl mx-auto px-8 sm:px-10 lg:px-16 py-24">
          <div className="max-w-xl">

            {/* Badge verde forestal sólido */}
            <div className="inline-flex items-center gap-2 bg-[#166534] text-white text-xs font-bold px-5 py-2.5 rounded-full mb-8 shadow-lg tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Bilingüe · Ciclo 2025–2026 · Inscripciones abiertas
            </div>

            {/* Título */}
            <h1 className="font-black text-white tracking-tight leading-none mb-0">
              <span className="block text-3xl md:text-4xl font-semibold text-blue-200/80 mb-2 tracking-wide">
                Instituto Educativo
              </span>
              <span className="block text-7xl md:text-8xl">Alegría</span>
            </h1>

            {/* Línea decorativa verde forestal */}
            <div className="flex items-center gap-2 mt-4 mb-6">
              <div className="w-20 h-1.5 bg-[#166534] rounded-full" />
              <div className="w-6 h-1.5 bg-[#166534]/40 rounded-full" />
            </div>

            {/* Lema */}
            <p className="flex items-center gap-3 text-blue-200/70 text-sm tracking-[0.2em] uppercase font-medium mb-8">
              <span className="w-5 h-px bg-[#166534] shrink-0" />
              "Valores para VIVIR"
            </p>

            <p className="text-lg text-blue-100/80 mb-10 leading-relaxed">
              Más de 20 años formando estudiantes con valores, conocimiento y
              la alegría de aprender. Educación bilingüe en Preescolar, Primaria y Secundaria.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/admisiones"
                className="inline-flex items-center gap-2 bg-[#166534] hover:bg-[#15742f] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 active:scale-95"
              >
                Inscribirse ahora <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/pago"
                className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 hover:bg-white/10 text-white font-semibold py-4 px-7 rounded-2xl transition-all"
              >
                <CreditCard className="w-4 h-4" />
                Pagar Colegiatura
              </Link>
            </div>
          </div>
        </div>

        {/* Fade hacia la barra de stats */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1e3166] to-transparent" />
      </section>

      {/* ── Stats ────────────────────────────────── */}
      <section className="relative py-12 overflow-hidden" style={{ background: 'linear-gradient(90deg, #1e3166 0%, #162248 50%, #0f3020 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 bg-[#166534]/30 border border-[#166534]/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-extrabold text-white">{value}</div>
                <div className="text-blue-200/70 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Niveles ──────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Nuestros Niveles Educativos</h2>
            <p className="section-subtitle">
              Ofrecemos una formación completa y continua adaptada a cada etapa del desarrollo.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {levels.map((lvl) => (
              <div key={lvl.title} className={`card border ${lvl.border}`}>
                <div className="relative h-52 overflow-hidden">
                  <img src={lvl.img} alt={lvl.title} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${lvl.color} opacity-60`} />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-2xl font-bold text-white">{lvl.title}</h3>
                    <p className="text-white/80 text-sm">{lvl.ages}</p>
                  </div>
                </div>
                <div className={`p-6 ${lvl.bg}`}>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{lvl.desc}</p>
                  <Link
                    to="/niveles"
                    className="text-primary-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Ver más <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/niveles" className="btn-primary inline-flex items-center gap-2">
              Ver todos los programas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Instalaciones y Vida Estudiantil ─────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Instalaciones y Vida Estudiantil</h2>
            <p className="section-subtitle">
              Espacios diseñados para el bienestar, el aprendizaje activo y el desarrollo creativo de nuestros alumnos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Aulas Multimedia', desc: 'Espacios climatizados con tecnología interactiva.', img: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&q=80' },
              { title: 'Laboratorios de Ciencias', desc: 'Equipamiento moderno para prácticas de biología y química.', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80' },
              { title: 'Canchas Deportivas', desc: 'Áreas para fútbol, básquetbol y actividades físicas.', img: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=600&q=80' },
              { title: 'Biblioteca Central', desc: 'Acervo actualizado y zonas de lectura silenciosa.', img: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&q=80' },
              { title: 'Talleres de Arte', desc: 'Fomentamos la creatividad plástica y musical.', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80' },
              { title: 'Cafetería Saludable', desc: 'Menús balanceados supervisados por nutriólogos.', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80' },
            ].map((facility) => (
              <div key={facility.title} className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all h-64">
                <img src={facility.img} alt={facility.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e3166]/90 via-[#1e3166]/40 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{facility.title}</h3>
                  <p className="text-blue-100/90 text-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    {facility.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="section-title text-left">¿Por qué elegir el Instituto Alegría?</h2>
              <p className="text-gray-500 mb-8">
                Somos una institución comprometida con la formación integral de cada estudiante.
                Nuestro enfoque combina excelencia académica con valores y desarrollo personal.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {values.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
                      <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/nosotros" className="btn-outline">Conocer más</Link>
                <Link to="/admisiones" className="btn-primary">Solicitar inscripción</Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1544717305-996b815c338c?w=700&q=80"
                alt="Instalaciones escolares"
                className="rounded-2xl shadow-2xl w-full object-cover h-96"
              />
              <div className="absolute -bottom-5 -left-5 bg-gold-500 text-white p-4 rounded-2xl shadow-xl">
                <CheckCircle className="w-6 h-6 mb-1" />
                <p className="font-bold text-lg">Incorporado a la SEP</p>
                <p className="text-xs text-gold-100">Clave oficial certificada</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────── */}
      <section className="py-20 bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Lo que dicen las familias</h2>
            <p className="text-primary-200 max-w-xl mx-auto">
              La confianza de nuestras familias es nuestra mayor motivación.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="text-blue-100 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-blue-300 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────── */}
      <section className="py-16 bg-gold-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">
            ¿Listo para inscribir a tu hijo?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Plazas limitadas para el ciclo 2025–2026. ¡No pierdas tu lugar!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/admisiones" className="bg-white text-[#166534] hover:bg-gray-50 font-bold py-3 px-8 rounded-xl transition-colors shadow-lg">
              Solicitar admisión
            </Link>
            <a href="tel:+521234567890" className="flex items-center gap-2 border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-xl transition-colors">
              <Phone className="w-4 h-4" />
              Llamar ahora
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
