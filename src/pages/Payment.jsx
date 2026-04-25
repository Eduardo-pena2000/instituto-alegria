import { useState, useEffect, useRef } from 'react'
import SEO from '../components/SEO'
import { useLocation } from 'react-router-dom'
import {
  Search, CreditCard, Lock, CheckCircle, Shield, AlertCircle,
  User, ChevronRight, ArrowLeft, ShieldCheck, Calendar, BookOpen,
  Phone, Mail, X, Send
} from 'lucide-react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { API_URL, STRIPE_PK } from '../config'
import { getTuitionStatus, fmtDate } from '../utils/helpers'
import { TUITION, NIVEL_COLORS } from '../utils/constants'

const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null

/* ─── Stripe Checkout Form ──────────────────────────── */
function CheckoutForm({ selected, tuition, onSuccess, onBack }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [elementReady, setElementReady] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements || !elementReady) return
    setProcessing(true)
    setError(null)

    // First, validate the Payment Element
    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message)
      setProcessing(false)
      return
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pago?success=true`,
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message)
      setProcessing(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Record payment in our database
      try {
        await fetch(`${API_URL}/api/payments/record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: selected.id,
            stripePaymentId: paymentIntent.id,
          }),
        })
      } catch {
        // Payment succeeded in Stripe, webhook will handle if this fails
      }
      onSuccess(paymentIntent.id)
    }
  }

  return (
    <div className="relative">
      {/* Processing overlay — shown on top, but form stays mounted underneath */}
      {processing && (
        <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl py-16">
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
      )}

      {/* Form — always mounted so PaymentElement stays in the DOM */}
      <form onSubmit={handleSubmit} className={`space-y-5 ${processing ? 'invisible' : ''}`}>
        <PaymentElement
          onReady={() => setElementReady(true)}
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                email: selected.email || '',
              }
            }
          }}
        />

        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <button type="submit" disabled={!stripe || !elements || !elementReady || processing}
          className="w-full py-4 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #166534 0%, #22a84a 100%)' }}>
          <Lock className="w-5 h-5" />
          Pagar {tuition?.display}
        </button>

        <button type="button" onClick={onBack}
          className="w-full py-2.5 text-sm text-gray-400 hover:text-[#1e3166] font-medium transition-colors">
          Volver al resumen
        </button>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-300 pt-1">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Pago seguro con Stripe</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Cifrado PCI DSS</span>
        </div>
      </form>
    </div>
  )
}

/* ─── Main Component ────────────────────────────────── */
export default function Payment() {
  // Steps: 1=search, 2=curp verify, 3=adeudo, 4=payment form, 6=success
  const [step, setStep] = useState(1)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [curpInput, setCurpInput] = useState('')
  const [curpError, setCurpError] = useState('')
  const [clientSecret, setClientSecret] = useState(null)
  const [folio, setFolio] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [isStartingPayment, setIsStartingPayment] = useState(false)
  const searchRef = useRef(null)
  const location = useLocation()

  // If coming from Parent Portal, skip search/CURP steps
  useEffect(() => {
    if (location.state?.fromPortal && location.state?.student) {
      setSelected(location.state.student)
      setStep(3)
    }
  }, [])

  // Search students via API
  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const controller = new AbortController()
    fetch(`${API_URL}/api/students/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(setResults)
      .catch(() => { })
    return () => controller.abort()
  }, [query])

  const selectStudent = s => {
    setSelected(s)
    setQuery('')
    setResults([])
    setStep(2)
    setCurpInput('')
    setCurpError('')
  }

  // Verify CURP via API (never exposes real CURP to client)
  const verifyCurp = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/api/students/verify-curp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selected.id, curp: curpInput }),
      })
      const { verified } = await res.json()
      if (verified) {
        setStep(3)
        setCurpError('')
      } else {
        setCurpError('El CURP no coincide con el alumno seleccionado. Verifícalo e intenta de nuevo.')
      }
    } catch {
      setCurpError('Error de conexión. Intenta de nuevo.')
    }
  }

  // Create PaymentIntent and move to payment step
  const startPayment = async () => {
    if (isStartingPayment) return
    setIsStartingPayment(true)
    setPaymentError('')
    try {
      const res = await fetch(`${API_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: selected.nivel,
          studentName: `${selected.nombre} ${selected.apellido}`,
          grade: selected.grado,
          parentEmail: selected.email || '',
          studentId: selected.id,
        }),
      })
      if (!res.ok) throw new Error('Error creando intención de pago')
      const { clientSecret: cs } = await res.json()
      setClientSecret(cs)
      setStep(4)
    } catch (err) {
      setPaymentError('Error al preparar el pago. Verifica tu conexión e intenta de nuevo.')
    } finally {
      setIsStartingPayment(false)
    }
  }

  const handlePaymentSuccess = (stripePaymentId) => {
    const newFolio = crypto.randomUUID().slice(0, 8).toUpperCase()
    setSelected(prev => ({ ...prev, ultimoPago: new Date().toISOString().split('T')[0] }))
    setFolio(newFolio)
    setClientSecret(null)
    setStep(6)
  }

  const reset = () => {
    setStep(1)
    setSelected(null)
    setQuery('')
    setCurpInput('')
    setClientSecret(null)
    setPaymentError('')
  }

  const status = selected ? getTuitionStatus(selected.ultimoPago) : null
  const tuition = selected ? TUITION[selected.nivel] : null

  const visibleSteps = [
    { n: 1, label: 'Buscar' },
    { n: 2, label: 'Verificar' },
    { n: 3, label: 'Adeudo' },
    { n: 4, label: 'Pagar' },
    { n: 6, label: 'Listo' },
  ]

  return (
    <div className="pt-16 md:pt-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      <SEO 
        title="Pagar Colegiatura — Instituto Educativo Alegría" 
        description="Realiza el pago de colegiatura en línea de forma rápida y segura. Plataforma oficial del Instituto Educativo Alegría." 
      />

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
              const activeStep = step
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
                      {status.label === 'VIGENTE' && 'Colegiatura al corriente'}
                      {status.label === 'POR VENCER' && 'Colegiatura por vencer'}
                      {status.label === 'VENCIDA' && 'Colegiatura vencida'}
                    </p>
                    <p className="text-sm opacity-70">Último pago registrado: {fmtDate(selected.ultimoPago)}</p>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
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

                {paymentError && (
                  <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {paymentError}
                  </div>
                )}

                {/* Pay button */}
                {status.label !== 'VIGENTE' ? (
                  <button onClick={startPayment}
                    disabled={isStartingPayment}
                    className="w-full py-4 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #166534 0%, #22a84a 100%)' }}>
                    {isStartingPayment ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                        </svg>
                        Procesando...
                      </span>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pagar colegiatura — {tuition?.display}
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-green-700 font-semibold text-sm">La colegiatura está al corriente. No hay adeudo pendiente.</p>
                    </div>
                    <button onClick={startPayment}
                      disabled={isStartingPayment}
                      className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-[#1e3166] hover:text-[#1e3166] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Calendar className="w-4 h-4" />
                      {isStartingPayment ? 'Procesando...' : 'Adelantar próximo mes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ Step 4: Stripe Payment Form ═══ */}
        {step === 4 && selected && clientSecret && stripePromise && (
          <div className="space-y-6">
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

              {/* Stripe Elements payment form */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3166] to-[#166534] flex items-center justify-center shadow-md">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Datos de pago</h2>
                  </div>

                  <Elements stripe={stripePromise} options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#1e3166',
                        borderRadius: '12px',
                        fontFamily: 'Inter, system-ui, sans-serif',
                      },
                    },
                  }}>
                    <CheckoutForm
                      selected={selected}
                      tuition={tuition}
                      onSuccess={handlePaymentSuccess}
                      onBack={() => { setStep(3); setClientSecret(null) }}
                    />
                  </Elements>
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
            {/* Email notification */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-8"
              style={{ animation: 'slideInRight 0.5s ease-out 0.5s both' }}>
              <style>{`@keyframes slideInRight{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
              <Send className="w-3.5 h-3.5" />
              Recibo enviado por Stripe a tu correo
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
