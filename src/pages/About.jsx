import { Link } from 'react-router-dom'
import { Target, Eye, Heart, Users, Award, BookOpen, Leaf, Shield, Star, ArrowRight, GraduationCap } from 'lucide-react'

const team = [
  {
    name: 'Lic. Patricia Flores',
    role: 'Directora General',
    desc: 'Más de 25 años en educación. Especialista en pedagogía y gestión escolar.',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80',
  },
  {
    name: 'Mtro. Roberto Sánchez',
    role: 'Director Académico',
    desc: 'Maestro en Educación por la UNAM. Responsable del programa académico.',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80',
  },
  {
    name: 'Lic. Laura Jiménez',
    role: 'Coordinadora de Preescolar',
    desc: 'Especialista en educación inicial y desarrollo infantil temprano.',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80',
  },
  {
    name: 'Mtro. Andrés López',
    role: 'Coordinador de Primaria',
    desc: 'Maestro certificado con experiencia en metodologías activas de aprendizaje.',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
  },
]

const values = [
  { icon: Heart,   color: 'bg-rose-100 text-rose-600',   title: 'Amor',       desc: 'Enseñamos con pasión y entrega total a cada estudiante.' },
  { icon: Shield,  color: 'bg-blue-100 text-blue-600',   title: 'Respeto',    desc: 'Fomentamos el respeto entre toda la comunidad escolar.' },
  { icon: Leaf,    color: 'bg-green-100 text-green-600', title: 'Crecimiento',desc: 'Impulsamos el desarrollo continuo de cada alumno.' },
  { icon: Star,    color: 'bg-gold-100 text-gold-600',   title: 'Excelencia', desc: 'Buscamos siempre el más alto nivel académico.' },
  { icon: Users,   color: 'bg-purple-100 text-purple-600',title: 'Comunidad', desc: 'Construimos lazos fuertes entre familias y maestros.' },
  { icon: BookOpen,color: 'bg-indigo-100 text-indigo-600',title: 'Aprendizaje',desc: 'El conocimiento es el pilar de todo lo que hacemos.' },
]

const timeline = [
  { year: '2003', event: 'Fundación del instituto con nivel Primaria' },
  { year: '2008', event: 'Incorporación del nivel Preescolar' },
  { year: '2012', event: 'Apertura del nivel Secundaria' },
  { year: '2015', event: 'Inauguración del laboratorio de ciencias' },
  { year: '2018', event: 'Laboratorio de computación e innovación' },
  { year: '2022', event: 'Renovación completa de instalaciones' },
  { year: '2024', event: 'Plataforma digital y pago en línea' },
]

export default function About() {
  return (
    <div className="pt-16 md:pt-20">

      {/* Hero */}
      <section className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0e1630 0%, #1e3166 55%, #0b2614 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=80')",
          backgroundSize: 'cover', backgroundPosition: 'center'
        }} />
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#166534]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#166534] text-white text-xs font-bold px-5 py-2 rounded-full mb-6 uppercase tracking-widest">
            Instituto Educativo Alegría · Bilingüe
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Nuestra Historia</h1>
          <div className="w-16 h-1 bg-[#166534] rounded-full mx-auto mb-4" />
          <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
            Más de 20 años construyendo sueños y formando el futuro de México,
            un estudiante a la vez.
          </p>
        </div>
      </section>

      {/* Misión & Visión */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="card p-8 border-l-4 border-primary-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Misión</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Brindar una educación de calidad integral que desarrolle en cada estudiante
                las competencias académicas, habilidades sociales y valores éticos necesarios
                para ser agentes de cambio positivo en su comunidad y en el mundo.
                Trabajamos en alianza con las familias para garantizar el éxito de cada alumno.
              </p>
            </div>

            <div className="card p-8 border-l-4 border-gold-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-gold-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Visión</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Ser reconocidos como la institución educativa líder en la región por nuestra
                excelencia académica, innovación pedagógica y formación en valores. Aspiramos
                a que cada egresado del Instituto Educativo Alegría sea un ciudadano íntegro,
                crítico y comprometido con el bienestar social.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Nuestros Valores</h2>
            <p className="section-subtitle">Los principios que guían todo lo que hacemos en el Instituto Alegría.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="card p-6 text-center hover:scale-105 transition-transform">
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Nuestra Trayectoria</h2>
            <p className="section-subtitle">Dos décadas de crecimiento y compromiso con la educación.</p>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-200" />
            <div className="space-y-8">
              {timeline.map(({ year, event }) => (
                <div key={year} className="flex gap-6 items-start relative">
                  <div className="w-16 h-16 bg-primary-700 rounded-2xl flex items-center justify-center shrink-0 z-10 shadow-lg">
                    <span className="text-white font-bold text-xs">{year}</span>
                  </div>
                  <div className="card p-4 flex-1 mt-2">
                    <p className="font-medium text-gray-800">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Nuestro Equipo Directivo</h2>
            <p className="section-subtitle">Profesionales comprometidos con la educación de tus hijos.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="card text-center overflow-hidden">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-48 object-cover object-top"
                />
                <div className="p-5">
                  <h3 className="font-bold text-gray-900">{member.name}</h3>
                  <p className="text-primary-600 text-sm font-medium mt-0.5">{member.role}</p>
                  <p className="text-gray-500 text-xs mt-2 leading-relaxed">{member.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0e1630 0%, #1e3166 60%, #0b2614 100%)' }}>
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#166534]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Award,       value: '15+', label: 'Reconocimientos' },
              { icon: Users,       value: '50+', label: 'Maestros certificados' },
              { icon: GraduationCap, value: '3,000+', label: 'Egresados' },
              { icon: Star,        value: '9.5', label: 'Calificación promedio SEP' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <div className="w-12 h-12 bg-[#166534]/30 border border-[#166534]/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-extrabold text-white">{value}</div>
                <div className="text-blue-200/70 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Únete a nuestra comunidad educativa
          </h2>
          <p className="text-gray-500 mb-8">
            Estamos listos para recibir a tu familia. Conoce nuestro proceso de admisiones.
          </p>
          <Link to="/admisiones" className="btn-primary inline-flex items-center gap-2">
            Ver proceso de admisión <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  )
}
