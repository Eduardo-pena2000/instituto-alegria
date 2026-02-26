import { useState, useEffect, useRef } from 'react'
import {
  Search, CreditCard, Lock, CheckCircle, Shield, AlertCircle,
  User, ChevronRight, ArrowLeft, ShieldCheck, Calendar, BookOpen,
  Phone, Mail, X, Send
} from 'lucide-react'
import { INITIAL_STUDENTS } from '../data'

/* ─── Helpers (same logic as Admin) ─────────────────── */
function getTuitionStatus(ultimoPago) {
  if (!ultimoPago) return { label: 'VENCIDA', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', order: 2 }
  const venc = new Date(ultimoPago)
  venc.setDate(venc.getDate() + 30)
  const hoy = new Date()
  const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24))
  if (hoy > venc) return { label: 'VENCIDA', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', order: 2 }
  if (diff <= 5) return { label: 'POR VENCER', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', order: 1 }
  return { label: 'VIGENTE', color: 'bg-green-100 text-green-700', dot: 'bg-green-500', order: 0 }
}

function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const TUITION = {
  preescolar: { label: 'Preescolar', amount: 1800, display: '$1,800.00 MXN' },
  primaria: { label: 'Primaria', amount: 2200, display: '$2,200.00 MXN' },
  secundaria: { label: 'Secundaria', amount: 2500, display: '$2,500.00 MXN' },
}

const NIVEL_COLORS = {
  preescolar: 'bg-pink-100 text-pink-700',
  primaria: 'bg-blue-100 text-blue-700',
  secundaria: 'bg-emerald-100 text-emerald-700',
}

/* ─── Main Component ────────────────────────────────── */
export default function Payment() {
  // Steps: 1=search, 2=curp verify, 3=adeudo, 4=payment form, 5=processing, 6=success
  const [step, setStep] = useState(1)
  const [students, setStudents] = useState([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [curpInput, setCurpInput] = useState('')
  const [curpError, setCurpError] = useState('')
  const [cardData, setCardData] = useState({ nombre: '', numero: '', exp: '', cvv: '' })
  const [folio, setFolio] = useState('')
  const searchRef = useRef(null)

  // Load students from localStorage
  useEffect(() => {
    let saved = localStorage.getItem('iea_students')
    if (!saved || JSON.parse(saved).length === 0) {
      localStorage.setItem('iea_students', JSON.stringify(INITIAL_STUDENTS))
      saved = JSON.stringify(INITIAL_STUDENTS)
    }
    setStudents(JSON.parse(saved))
  }, [])

  // Search logic
  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const q = query.toLowerCase()
    const matches = students.filter(s =>
      `${s.nombre} ${s.apellido}`.toLowerCase().includes(q)
    ).slice(0, 6)
    setResults(matches)
  }, [query, students])

  const selectStudent = s => {
    setSelected(s)
    setQuery('')
    setResults([])
    setStep(2)
    setCurpInput('')
    setCurpError('')
  }

  const verifyCurp = e => {
    e.preventDefault()
    if (curpInput.trim().toUpperCase() === (selected.curp || '').toUpperCase()) {
      setStep(3)
      setCurpError('')
    } else {
      setCurpError('El CURP no coincide con el alumno seleccionado. Verifícalo e intenta de nuevo.')
    }
  }

  const handlePay = e => {
    e.preventDefault()
    setStep(5)
    // Simulate processing
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0]
      const all = JSON.parse(localStorage.getItem('iea_students') || '[]')
      const updated = all.map(s => s.id === selected.id ? { ...s, ultimoPago: today } : s)
      localStorage.setItem('iea_students', JSON.stringify(updated))
      // Record payment history
      const history = JSON.parse(localStorage.getItem('iea_payment_history') || '[]')
      const newFolio = Math.random().toString(36).slice(2, 10).toUpperCase()
      history.unshift({
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        studentId: selected.id, studentName: `${selected.nombre} ${selected.apellido}`,
        nivel: selected.nivel, amount: TUITION[selected.nivel]?.amount ? TUITION[selected.nivel].amount / 100 : 0,
        date: today, folio: newFolio
      })
      localStorage.setItem('iea_payment_history', JSON.stringify(history))
      setSelected({ ...selected, ultimoPago: today })
      setFolio(newFolio)
      setStep(6)
    }, 2500)
  }

  const reset = () => {
    setStep(1)
    setSelected(null)
    setQuery('')
    setCurpInput('')
    setCardData({ nombre: '', numero: '', exp: '', cvv: '' })
  }

  const status = selected ? getTuitionStatus(selected.ultimoPago) : null
  const tuition = selected ? TUITION[selected.nivel] : null

  const stepLabels = [
    { n: 1, label: 'Buscar alumno' },
    { n: 2, label: 'Verificar CURP' },
    { n: 3, label: 'Adeudo' },
    { n: 4, label: 'Pago' },
    { n: 5, label: 'Procesando' },
    { n: 6, label: 'Confirmación' },
  ]
  // Visible steps in stepper
  const visibleSteps = [
    { n: 1, label: 'Buscar' },
    { n: 2, label: 'Verificar' },
    { n: 3, label: 'Adeudo' },
    { n: 4, label: 'Pagar' },
    { n: 6, label: 'Listo' },
  ]

  return (
    <div className="pt-16 md:pt-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">

      {/* Hero Header */}
      <section className="relative py-14 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0e1630 0%, #1e3166 55%, #0b2614 100%)' }}>
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#166534]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-[#166534] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Pago de Colegiatura en Línea</h1>
          <div className="w-16 h-1 bg-[#166534] rounded-full mx-auto mb-3" />
          <p className="text-blue-100/80 text-lg">
            Busca a tu hijo(a), verifica su identidad y realiza el pago de forma segura.
          </p>
        </div>
      </section>

      {/* Steps indicator */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {visibleSteps.map(({ n, label }, i, arr) => {
              const activeStep = step === 5 ? 4 : step
              return (
                <div key={n} className="flex items-center gap-2 sm:gap-3">
                  <div className={`flex items-center gap-1.5 ${activeStep >= n ? 'text-[#1e3166]' : 'text-gray-300'}`}>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${activeStep > n ? 'bg-[#166534] text-white shadow-md' :
                      activeStep === n ? 'bg-[#1e3166] text-white shadow-md' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                      {activeStep > n ? '✓' : visibleSteps.indexOf(visibleSteps.find(s => s.n === n)) + 1}
                    </div>
                    <span className="hidden sm:block text-xs font-medium">{label}</span>
                  </div>
                  {i < arr.length - 1 && <div className={`w-6 sm:w-10 h-0.5 rounded-full transition-all ${activeStep > n ? 'bg-[#166534]' : 'bg-gray-200'}`} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ═══ Step 1: Search Student ═══ */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1e3166] to-[#2d4a9e] flex items-center justify-center shadow-md">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Buscar alumno</h2>
                  <p className="text-sm text-gray-400">Escribe el nombre de tu hijo(a) para encontrarlo</p>
                </div>
              </div>

              <div className="relative" ref={searchRef}>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#1e3166] transition-colors" />
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Escribe el nombre del alumno..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1e3166] focus:bg-white text-base font-medium text-gray-800 outline-none transition-all placeholder:text-gray-300"
                    autoFocus
                  />
                </div>

                {/* Search results dropdown */}
                {results.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20">
                    {results.map(s => {
                      const st = getTuitionStatus(s.ultimoPago)
                      return (
                        <button
                          key={s.id}
                          onClick={() => selectStudent(s)}
                          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-blue-50/50 transition-colors text-left border-b border-gray-50 last:border-0"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e3166] to-[#2d4a9e] flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {s.nombre[0]}{s.apellido[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm">{s.nombre} {s.apellido}</p>
                            <p className="text-xs text-gray-400">{TUITION[s.nivel]?.label} · {s.grado} "{s.grupo}"</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${st.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                        </button>
                      )
                    })}
                  </div>
                )}

                {query.length >= 2 && results.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                    <BookOpen className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No se encontraron alumnos con ese nombre</p>
                    <p className="text-xs text-gray-300 mt-1">Verifica la ortografía o contacta a la escuela</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                <Shield className="w-4 h-4 text-[#1e3166] mt-0.5 shrink-0" />
                <p className="text-xs text-gray-500">
                  Después de seleccionar al alumno, se te pedirá ingresar el <strong>CURP</strong> como verificación
                  de identidad para proteger la información del estudiante.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Step 2: CURP Verification ═══ */}
        {step === 2 && selected && (
          <div className="space-y-6">
            <button onClick={() => { setStep(1); setSelected(null) }} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#1e3166] transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" /> Buscar otro alumno
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1e3166] to-[#2d4a9e] flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Verificación de identidad</h2>
                  <p className="text-sm text-gray-400">Confirma que eres el tutor del alumno</p>
                </div>
              </div>

              {/* Selected student mini card */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1e3166] to-[#2d4a9e] flex items-center justify-center text-white font-bold text-base shrink-0">
                  {selected.nombre[0]}{selected.apellido[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selected.nombre} {selected.apellido}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${NIVEL_COLORS[selected.nivel]}`}>
                    {TUITION[selected.nivel]?.label} · {selected.grado} "{selected.grupo}"
                  </span>
                </div>
              </div>

              <form onSubmit={verifyCurp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">CURP del alumno</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1e3166] transition-colors" />
                    <input
                      type="text"
                      value={curpInput}
                      onChange={e => { setCurpInput(e.target.value.toUpperCase()); setCurpError('') }}
                      placeholder="Ingresa el CURP (18 caracteres)"
                      maxLength={18}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1e3166] focus:bg-white text-base font-mono font-medium text-gray-800 outline-none transition-all placeholder:text-gray-300 placeholder:font-sans tracking-wider"
                      autoFocus
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-300 mt-2">El CURP fue proporcionado al momento de la inscripción</p>
                </div>

                {curpError && (
                  <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {curpError}
                  </div>
                )}

                <button type="submit"
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #1e3166 0%, #166534 100%)' }}>
                  <ShieldCheck className="w-4 h-4" />
                  Verificar identidad
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══ Step 3: Adeudo / Balance ═══ */}
        {step === 3 && selected && (
          <div className="space-y-6">
            <button onClick={reset} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#1e3166] transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" /> Buscar otro alumno
            </button>

            {/* Student card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 pb-4" style={{ background: 'linear-gradient(135deg, #1e3166 0%, #243d80 60%, #1a5a2f 100%)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border border-white/20">
                    {selected.nombre[0]}{selected.apellido[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{selected.nombre} {selected.apellido}</h2>
                    <p className="text-blue-200/70 text-sm font-medium">{TUITION[selected.nivel]?.label} · {selected.grado} "{selected.grupo}"</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Status card */}
                <div className={`rounded-xl p-5 flex items-center gap-4 ${status.label === 'VIGENTE' ? 'bg-green-50 border border-green-100' :
                  status.label === 'POR VENCER' ? 'bg-amber-50 border border-amber-100' :
                    'bg-red-50 border border-red-100'
                  }`}>
                  <span className={`w-4 h-4 rounded-full ${status.dot} shrink-0`} />
                  <div className="flex-1">
                    <p className="font-bold text-base">
                      {status.label === 'VIGENTE' && '✅ Colegiatura al corriente'}
                      {status.label === 'POR VENCER' && '⚠️ Colegiatura por vencer'}
                      {status.label === 'VENCIDA' && '❌ Colegiatura vencida'}
                    </p>
                    <p className="text-sm opacity-70">Último pago registrado: {fmtDate(selected.ultimoPago)}</p>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tutor</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{selected.nombrePadre || selected.nombreMadre || '—'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Teléfono</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{selected.telefono}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Colegiatura mensual</p>
                    <p className="text-sm font-bold text-[#1e3166] mt-0.5">{tuition?.display}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Próximo vencimiento</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">
                      {selected.ultimoPago ? fmtDate(new Date(new Date(selected.ultimoPago).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) : '—'}
                    </p>
                  </div>
                </div>

                {/* Pay button */}
                {status.label !== 'VIGENTE' ? (
                  <button onClick={() => setStep(4)}
                    className="w-full py-4 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #166534 0%, #22a84a 100%)' }}>
                    <CreditCard className="w-5 h-5" />
                    Pagar colegiatura — {tuition?.display}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-green-700 font-semibold text-sm">La colegiatura está al corriente. No hay adeudo pendiente.</p>
                    </div>
                    <button onClick={() => setStep(4)}
                      className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-[#1e3166] hover:text-[#1e3166] transition-all flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Adelantar próximo mes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ Step 4: Payment Form ═══ */}
        {(step === 4 || step === 5) && selected && (
          <div className="space-y-6">
            {step === 4 && (
              <button onClick={() => setStep(3)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#1e3166] transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" /> Volver al resumen
              </button>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Summary sidebar */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Resumen</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Alumno</span>
                      <span className="font-semibold text-gray-800">{selected.nombre} {selected.apellido}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nivel</span>
                      <span className="font-medium text-gray-800">{TUITION[selected.nivel]?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Grado</span>
                      <span className="font-medium text-gray-800">{selected.grado} "{selected.grupo}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Concepto</span>
                      <span className="font-medium text-gray-800">Colegiatura mensual</span>
                    </div>
                    <hr className="border-gray-100" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total a pagar</span>
                      <span className="text-2xl font-extrabold text-[#166534]">{tuition?.display}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment form */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3166] to-[#166534] flex items-center justify-center shadow-md">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Datos de pago</h2>
                  </div>

                  {step === 5 ? (
                    /* Processing animation */
                    <div className="py-16 text-center">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e3166, #166534)' }}>
                        <svg className="w-8 h-8 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Procesando tu pago...</h3>
                      <p className="text-sm text-gray-400">No cierres esta ventana. Esto tomará unos segundos.</p>
                      <div className="w-48 h-1.5 bg-gray-100 rounded-full mx-auto mt-6 overflow-hidden">
                        <div className="h-full rounded-full animate-pulse" style={{ background: 'linear-gradient(90deg, #1e3166, #166534)', width: '70%' }} />
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handlePay} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nombre del titular</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1e3166] transition-colors" />
                          <input type="text" value={cardData.nombre} onChange={e => setCardData({ ...cardData, nombre: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1e3166] focus:bg-white text-sm font-medium text-gray-800 outline-none transition-all placeholder:text-gray-300"
                            placeholder="Como aparece en la tarjeta" required />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Número de tarjeta</label>
                        <div className="relative group">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1e3166] transition-colors" />
                          <input type="text" value={cardData.numero} onChange={e => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 16)
                            const formatted = v.replace(/(\d{4})(?=\d)/g, '$1 ')
                            setCardData({ ...cardData, numero: formatted })
                          }}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1e3166] focus:bg-white text-sm font-mono font-medium text-gray-800 outline-none transition-all placeholder:text-gray-300 placeholder:font-sans tracking-wider"
                            placeholder="1234 5678 9012 3456" required />
                        </div>
                        <p className="text-[10px] text-gray-300 mt-1.5">Demo: cualquier número de 16 dígitos</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Fecha exp.</label>
                          <input type="text" value={cardData.exp} onChange={e => {
                            let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                            if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
                            setCardData({ ...cardData, exp: v })
                          }}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1e3166] focus:bg-white text-sm font-mono font-medium text-gray-800 outline-none transition-all placeholder:text-gray-300 placeholder:font-sans"
                            placeholder="MM/AA" required />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">CVV</label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1e3166] transition-colors" />
                            <input type="text" value={cardData.cvv} onChange={e => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1e3166] focus:bg-white text-sm font-mono font-medium text-gray-800 outline-none transition-all placeholder:text-gray-300 placeholder:font-sans"
                              placeholder="123" required />
                          </div>
                        </div>
                      </div>

                      <button type="submit"
                        className="w-full py-4 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #166534 0%, #22a84a 100%)' }}>
                        <Lock className="w-5 h-5" />
                        Pagar {tuition?.display}
                      </button>

                      <div className="flex items-center justify-center gap-4 text-xs text-gray-300 pt-1">
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Pago seguro SSL</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Cifrado 256-bit</span>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Step 6: Success ═══ */}
        {step === 6 && selected && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 sm:p-12 text-center">
            <style>{`@keyframes popIn{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}`}</style>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #166534 0%, #22a84a 100%)', animation: 'popIn 0.5s ease-out' }}>
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">¡Pago exitoso!</h2>
            <p className="text-gray-400 mb-4 max-w-sm mx-auto">
              La colegiatura de <strong className="text-gray-700">{selected.nombre} {selected.apellido}</strong> ha sido registrada correctamente.
            </p>
            {/* Email simulation */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-8"
              style={{ animation: 'slideInRight 0.5s ease-out 0.5s both' }}>
              <style>{`@keyframes slideInRight{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
              <Send className="w-3.5 h-3.5" />
              Comprobante enviado a {selected.email || 'correo@email.com'}
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 max-w-sm mx-auto mb-8 text-left space-y-3 border border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Alumno</span>
                <span className="font-semibold text-gray-800">{selected.nombre} {selected.apellido}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Nivel / Grado</span>
                <span className="font-medium text-gray-800">{TUITION[selected.nivel]?.label} · {selected.grado}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Monto pagado</span>
                <span className="font-bold text-[#166534]">{tuition?.display}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Folio</span>
                <span className="font-mono text-xs text-[#1e3166] font-bold bg-blue-50 px-2 py-0.5 rounded">#{folio}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fecha</span>
                <span className="font-medium text-gray-800">{fmtDate(new Date().toISOString().split('T')[0])}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estado</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  VIGENTE
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-[#1e3166] hover:text-[#1e3166] transition-all">
                Imprimir comprobante
              </button>
              <button onClick={reset}
                className="px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #1e3166 0%, #166534 100%)' }}>
                Realizar otro pago
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
