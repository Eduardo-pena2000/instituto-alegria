import { useState, useEffect } from 'react'
import {
    Lock, ArrowRight, User, ShieldCheck, CreditCard,
    LogOut, AlertCircle, FileText, ChevronRight, Calendar
} from 'lucide-react'

/* ─── Helpers ─────────────────────────────────────────── */
function getTuitionStatus(ultimoPago) {
    if (!ultimoPago) return { label: 'VENCIDA', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
    const venc = new Date(ultimoPago)
    venc.setDate(venc.getDate() + 30)
    const hoy = new Date()
    const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24))
    if (hoy > venc) return { label: 'VENCIDA', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
    if (diff <= 5) return { label: 'POR VENCER', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' }
    return { label: 'VIGENTE', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' }
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

/* ─── Components ──────────────────────────────────────── */

// ── Login ──
function ParentLogin({ onLogin }) {
    const [curp, setCurp] = useState('')
    const [error, setError] = useState('')

    const handleLogin = e => {
        e.preventDefault()
        const students = JSON.parse(localStorage.getItem('iea_students') || '[]')
        const match = students.find(s => s.curp.toUpperCase() === curp.trim().toUpperCase())
        if (match) {
            onLogin(match)
        } else {
            setError('CURP no encontrado. Por favor verifica los datos o contacta a la escuela.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-green-100 rounded-full blur-3xl opacity-50 mix-blend-multiply" />

            <div className="mx-auto w-full max-w-md relative z-10">
                <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100/50 backdrop-blur-xl">
                    <div className="p-10 text-center relative" style={{ background: 'linear-gradient(180deg, rgba(30,49,102,0.03) 0%, rgba(255,255,255,0) 100%)' }}>
                        <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-6 shadow-xl ring-4 ring-white transform hover:scale-105 transition-transform duration-300">
                            <img src="/logo.jpg" alt="IEA Logo" className="w-full h-full object-cover" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Portal de Padres</h1>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            Ingresa el CURP de tu hijo(a) para consultar su información académica y pagos
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="p-8 pt-0 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                CURP del alumno
                            </label>
                            <div className="relative group">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1e3166] transition-colors" />
                                <input
                                    type="text"
                                    value={curp}
                                    onChange={e => { setCurp(e.target.value.toUpperCase()); setError('') }}
                                    placeholder="Ingresa los 18 caracteres"
                                    maxLength={18}
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1e3166] focus:bg-white text-base font-mono font-medium text-gray-800 outline-none transition-all placeholder:text-gray-300 placeholder:font-sans tracking-wider"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <button type="submit"
                            className="w-full py-4 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #1e3166 0%, #166534 100%)' }}>
                            Acceder al portal
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>
                <div className="mt-6 flex flex-col items-center gap-4">
                    <a href="/" className="text-sm font-semibold text-[#1e3166] hover:text-[#166534] transition-colors flex items-center gap-1.5 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md">
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        Volver al sitio web principal
                    </a>
                    <p className="text-center text-xs text-gray-400 font-medium">
                        Instituto Educativo Alegría · Valores para VIVIR
                    </p>
                </div>
            </div>
        </div>
    )
}

// ── Main Portal ──
export default function ParentPortal() {
    const [student, setStudent] = useState(null)
    const [history, setHistory] = useState([])

    // Load active student and their history
    useEffect(() => {
        const savedId = localStorage.getItem('iea_parent_session')
        if (savedId) {
            const all = JSON.parse(localStorage.getItem('iea_students') || '[]')
            const s = all.find(x => x.id === savedId)
            if (s) setStudent(s)
            else localStorage.removeItem('iea_parent_session')
        }
    }, [])

    useEffect(() => {
        if (student) {
            const allHistory = JSON.parse(localStorage.getItem('iea_payment_history') || '[]')
            setHistory(allHistory.filter(h => h.studentId === student.id))
        }
    }, [student])

    const handleLogin = s => {
        localStorage.setItem('iea_parent_session', s.id)
        setStudent(s)
    }

    const logout = () => {
        localStorage.removeItem('iea_parent_session')
        setStudent(null)
    }

    if (!student) return <ParentLogin onLogin={handleLogin} />

    const st = getTuitionStatus(student.ultimoPago)
    const tuition = TUITION[student.nivel]
    const venc = new Date(student.ultimoPago)
    venc.setDate(venc.getDate() + 30)

    return (
        <div className="pt-16 md:pt-20 bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-[64px] md:top-[80px] z-30 shadow-sm backdrop-blur-md bg-white/90">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md ring-2 ring-white">
                            <img src="/logo.jpg" alt="IEA Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h1 className="font-extrabold text-gray-900 leading-tight text-lg tracking-tight">Portal de Padres</h1>
                            <p className="text-xs text-gray-500 font-semibold tracking-wide">INSITUTO EDUCATIVO ALEGRÍA</p>
                        </div>
                    </div>
                    <button onClick={logout} className="p-2 sm:px-4 sm:py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
                        <span className="hidden sm:inline">Cerrar sesión</span>
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Student Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" style={{ background: 'linear-gradient(135deg, #1e3166 0%, #243d80 50%, #1a5a2f 100%)' }}>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{student.nombre} {student.apellido}</h2>
                            <div className="flex flex-wrap items-center gap-2 text-blue-100 font-medium text-sm">
                                <span className="bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10">{tuition?.label}</span>
                                <span>•</span>
                                <span>{student.grado} "{student.grupo}"</span>
                                <span>•</span>
                                <span className="font-mono text-xs opacity-75">{student.curp}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tuition Status */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Estado de cuenta
                        </h3>

                        <div className={`rounded-xl p-5 mb-6 flex items-start gap-4 ${st.label === 'VIGENTE' ? 'bg-green-50 border border-green-100' :
                            st.label === 'POR VENCER' ? 'bg-amber-50 border border-amber-100' :
                                'bg-red-50 border border-red-100'
                            }`}>
                            <span className={`w-3 h-3 mt-1.5 rounded-full ${st.dot} shrink-0`} />
                            <div>
                                <p className={`font-bold text-base ${st.label === 'VIGENTE' ? 'text-green-800' :
                                    st.label === 'POR VENCER' ? 'text-amber-800' : 'text-red-800'
                                    }`}>
                                    {st.label === 'VIGENTE' && 'Colegiatura al corriente'}
                                    {st.label === 'POR VENCER' && 'Próxima a vencer'}
                                    {st.label === 'VENCIDA' && 'Colegiatura vencida'}
                                </p>
                                <p className={`text-sm mt-1 mb-2 ${st.label === 'VIGENTE' ? 'text-green-700' :
                                    st.label === 'POR VENCER' ? 'text-amber-700' : 'text-red-700'
                                    }`}>
                                    El pago mensual de <strong>{tuition?.display}</strong> cubre hasta el <strong>{fmtDate(venc.toISOString().split('T')[0])}</strong>.
                                </p>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Último pago registrado</p>
                                <p className="text-sm font-semibold text-gray-800">{fmtDate(student.ultimoPago)}</p>
                            </div>
                            <a href="/pago" className="btn-primary py-2 px-4 shadow-none hover:shadow-md text-sm">
                                {st.label === 'VIGENTE' ? 'Adelantar pago' : 'Pagar ahora'}
                            </a>
                        </div>
                    </div>

                    {/* School Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Ciclo Escolar 2024-2025
                        </h3>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-500">Fecha de inscripción</span>
                                <span className="font-semibold text-gray-800">{fmtDate(student.fechaInscripcion)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-500">Nivel Educativo</span>
                                <span className="font-semibold text-gray-800">{tuition?.label}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-500">Grado y Grupo</span>
                                <span className="font-semibold text-gray-800">{student.grado} "{student.grupo}"</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-500">Mensualidad</span>
                                <span className="font-bold text-[#1e3166]">{tuition?.display}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Historial de pagos
                        </h3>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {history.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                No hay pagos registrados en línea para este alumno.
                            </div>
                        ) : history.map(h => (
                            <div key={h.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">Pago de Colegiatura</p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                            <span>{fmtDate(h.date)}</span>
                                            <span>•</span>
                                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Folio #{h.folio}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right pl-14 sm:pl-0">
                                    <p className="font-extrabold text-[#166534] text-lg">${h.amount?.toLocaleString()}</p>
                                    <button className="text-xs text-[#1e3166] font-semibold hover:underline mt-0.5 flex items-center justify-end gap-1">
                                        Ver recibo <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    )
}
