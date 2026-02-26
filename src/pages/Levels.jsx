import { Link } from 'react-router-dom'
import { Clock, Users, BookOpen, CheckCircle, ArrowRight, Music, Palette, Trophy, Dumbbell } from 'lucide-react'

const levels = [
  {
    id: 'preescolar',
    title: 'Preescolar',
    emoji: '🌱',
    ages: '3 a 6 años',
    grades: 'Kínder 1, 2 y 3',
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    color: 'from-pink-500 to-rose-500',
    bgLight: 'bg-pink-50',
    border: 'border-pink-300',
    textColor: 'text-pink-700',
    desc: `En el nivel Preescolar, el aprendizaje se realiza a través del juego, el arte y la exploración.
    Nuestros pequeños desarrollan sus habilidades motoras, sociales, emocionales y cognitivas en un
    ambiente seguro, cálido y estimulante.`,
    subjects: [
      'Lenguaje y comunicación',
      'Pensamiento matemático',
      'Exploración del mundo',
      'Desarrollo personal y social',
      'Expresión artística',
      'Educación física',
    ],
    features: [
      'Grupos reducidos (máx. 20 alumnos)',
      'Docentes especializadas en educación inicial',
      'Área de juegos y exploración',
      'Actividades lúdicas y creativas',
      'Programa de adaptación gradual',
    ],
    schedule: '8:00 am – 1:00 pm',
    tuition: '$1,800',
  },
  {
    id: 'primaria',
    title: 'Primaria',
    emoji: '📚',
    ages: '6 a 12 años',
    grades: '1° a 6° grado',
    img: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80',
    color: 'from-blue-500 to-indigo-500',
    bgLight: 'bg-blue-50',
    border: 'border-blue-300',
    textColor: 'text-blue-700',
    desc: `La Primaria del Instituto Alegría ofrece una educación académica sólida y motivadora.
    Utilizamos metodologías activas que fomentan el pensamiento crítico, la creatividad y el
    trabajo colaborativo, preparando a los alumnos para enfrentar los retos del siglo XXI.`,
    subjects: [
      'Español',
      'Matemáticas',
      'Ciencias Naturales',
      'Historia y Geografía',
      'Inglés (desde 1°)',
      'Computación e Informática',
      'Educación Artística',
      'Educación Física',
    ],
    features: [
      'Clases de inglés desde primer grado',
      'Laboratorio de computación',
      'Biblioteca escolar actualizada',
      'Actividades deportivas',
      'Olimpiadas del conocimiento',
    ],
    schedule: '7:30 am – 2:00 pm',
    tuition: '$2,200',
  },
  {
    id: 'secundaria',
    title: 'Secundaria',
    emoji: '🎓',
    ages: '12 a 15 años',
    grades: '1° a 3° grado',
    img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
    color: 'from-green-500 to-emerald-500',
    bgLight: 'bg-green-50',
    border: 'border-green-300',
    textColor: 'text-green-700',
    desc: `En Secundaria, preparamos a los jóvenes para el bachillerato y la vida. Nuestro programa
    académico de alto nivel, combinado con actividades extracurriculares, forma estudiantes completos
    con valores sólidos y visión de futuro.`,
    subjects: [
      'Español',
      'Matemáticas',
      'Biología / Física / Química',
      'Historia y Geografía',
      'Inglés avanzado',
      'Formación Cívica y Ética',
      'Tecnología e Informática',
      'Educación Física y Deportes',
    ],
    features: [
      'Laboratorio de ciencias equipado',
      'Orientación vocacional',
      'Preparación para bachillerato',
      'Club de debate y oratoria',
      'Participación en concursos nacionales',
    ],
    schedule: '7:30 am – 2:30 pm',
    tuition: '$2,500',
  },
]

const extras = [
  { icon: Music,   label: 'Banda y Coro Escolar',   desc: 'Formación musical para todos los niveles' },
  { icon: Palette, label: 'Taller de Arte y Pintura', desc: 'Expresión creativa y artística' },
  { icon: Trophy,  label: 'Olimpiadas del Conocimiento', desc: 'Competencias académicas locales y regionales' },
  { icon: Dumbbell,label: 'Deportes Extraescolares', desc: 'Fútbol, basquetbol, voleibol y más' },
]

export default function Levels() {
  return (
    <div className="pt-16 md:pt-20">

      {/* Hero */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0e1630 0%, #1e3166 55%, #0b2614 100%)' }}>
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#166534]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#166534] text-white text-xs font-bold px-5 py-2 rounded-full mb-6 uppercase tracking-widest">
            Preescolar · Primaria · Secundaria
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Niveles Educativos
          </h1>
          <div className="w-16 h-1 bg-[#166534] rounded-full mx-auto mb-4" />
          <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
            Una formación completa desde los primeros años hasta la preparación para el bachillerato.
          </p>
        </div>
      </section>

      {/* Levels */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {levels.map((lvl, i) => (
            <div
              key={lvl.id}
              id={lvl.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Image side */}
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img src={lvl.img} alt={lvl.title} className="w-full h-80 object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${lvl.color} opacity-30`} />
                  <div className="absolute top-4 left-4">
                    <span className={`${lvl.bgLight} ${lvl.textColor} font-bold text-sm px-3 py-1.5 rounded-full border ${lvl.border}`}>
                      {lvl.emoji} {lvl.grades}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info side */}
              <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{lvl.emoji}</span>
                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">{lvl.title}</h2>
                    <p className={`${lvl.textColor} font-medium text-sm`}>{lvl.ages} · {lvl.grades}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">{lvl.desc}</p>

                {/* Subjects */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary-600" /> Materias
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lvl.subjects.map(s => (
                      <span key={s} className={`${lvl.bgLight} ${lvl.textColor} text-xs font-medium px-3 py-1 rounded-full border ${lvl.border}`}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3">Características</h3>
                  <ul className="space-y-2">
                    {lvl.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Schedule & tuition */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className={`${lvl.bgLight} rounded-xl p-4 flex items-center gap-3 flex-1 min-w-32`}>
                    <Clock className={`w-5 h-5 ${lvl.textColor}`} />
                    <div>
                      <p className="text-xs text-gray-500">Horario</p>
                      <p className="font-semibold text-gray-800 text-sm">{lvl.schedule}</p>
                    </div>
                  </div>
                  <div className={`${lvl.bgLight} rounded-xl p-4 flex items-center gap-3 flex-1 min-w-32`}>
                    <Users className={`w-5 h-5 ${lvl.textColor}`} />
                    <div>
                      <p className="text-xs text-gray-500">Colegiatura mensual</p>
                      <p className="font-semibold text-gray-800 text-sm">{lvl.tuition} MXN</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link to="/admisiones" className="btn-primary text-sm py-2.5 px-5">
                    Inscribirse
                  </Link>
                  <Link to="/pago" className="btn-outline text-sm py-2.5 px-5">
                    Pagar colegiatura
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Extracurriculares */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Actividades Extracurriculares</h2>
            <p className="section-subtitle">
              Más allá del aula: formamos estudiantes completos con talentos y habilidades diversas.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {extras.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="card p-6 text-center hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{label}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0e1630 0%, #1e3166 60%, #0b2614 100%)' }}>
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#166534]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            ¿Tienes dudas sobre el nivel ideal para tu hijo?
          </h2>
          <p className="text-blue-200/80 mb-8">
            Nuestro equipo de orientación está listo para ayudarte a elegir el camino correcto.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contacto" className="bg-white text-[#1e3166] hover:bg-gray-50 font-bold py-3 px-8 rounded-xl transition-colors">
              Contactar asesor
            </Link>
            <Link to="/admisiones" className="bg-[#166534] hover:bg-[#15742f] text-white font-semibold py-3 px-8 rounded-xl transition-colors flex items-center gap-2">
              Proceso de admisión <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
