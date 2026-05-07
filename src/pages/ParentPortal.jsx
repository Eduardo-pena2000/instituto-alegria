import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Lock, ArrowRight, User, ShieldCheck, CreditCard,
    LogOut, AlertCircle, FileText, ChevronRight, Calendar, ArrowLeft, CheckCircle,
    BookOpen, Shirt, ChevronDown, ChevronUp, ShoppingCart, Package
} from 'lucide-react'
import { API_URL } from '../config'
import { getTuitionStatus, fmtDate } from '../utils/helpers'
import { getCurrentTuition } from '../utils/constants'
import { REQUISITOS } from '../utils/requisitosData'
import SchoolStore from '../components/SchoolStore'

/* ─── Session helpers ─────────────────────────────────── */
function getParentSession() {
    const data = sessionStorage.getItem('iea_parent_auth')
    if (!data) return null
    try {
        const { token, studentId, expiresAt } = JSON.parse(data)
        if (Date.now() > expiresAt) {
            sessionStorage.removeItem('iea_parent_auth')
            return null
        }
        return { token, studentId }
    } catch {
        sessionStorage.removeItem('iea_parent_auth')
        return null
    }
}

function setParentSession(token, studentId) {
    sessionStorage.setItem('iea_parent_auth', JSON.stringify({
        token,
        studentId,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    }))
}

function clearParentSession() {
    sessionStorage.removeItem('iea_parent_auth')
}

/* ─── Components ──────────────────────────────────────── */

// ── Login ──
function ParentLogin({ onLogin }) {
    const [curp, setCurp] = useState('')
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`${API_URL}/api/auth/parent/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ curp, pin }),
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'CURP no encontrado')
            }
            const { token, student: studentInfo } = await res.json()
            setParentSession(token, studentInfo.id)

            // Fetch full student data
            const studentRes = await fetch(`${API_URL}/api/students/${studentInfo.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!studentRes.ok) throw new Error('Error al cargar datos del alumno')
            const fullStudent = await studentRes.json()
            onLogin(fullStudent, token)
        } catch (err) {
            setError(err.message || 'CURP no encontrado. Por favor verifica los datos o contacta a la escuela.')
        } finally {
            setLoading(false)
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

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                PIN de Acceso
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1e3166] transition-colors" />
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={e => { setPin(e.target.value); setError('') }}
                                    placeholder="Ingresa tu PIN de 4 dígitos"
                                    maxLength={4}
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1e3166] focus:bg-white text-base font-mono font-medium text-gray-800 outline-none transition-all placeholder:text-gray-300 placeholder:font-sans tracking-wider"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-4 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #1e3166 0%, #166534 100%)' }}>
                            {loading ? 'Verificando...' : 'Acceder al portal'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
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

// ── Requisitos del Ciclo Escolar ──
function RequisitosSection({ nivel }) {
    const [openSection, setOpenSection] = useState(null)
    const req = REQUISITOS[nivel]
    if (!req) return null

    const toggle = (section) => setOpenSection(openSection === section ? null : section)

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Requisitos del Ciclo Escolar 2025-2026
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                    Lista de uniformes y materiales para <strong>{getCurrentTuition(nivel).label}</strong>
                </p>
            </div>

            {/* Uniformes */}
            <div className="border-b border-gray-50">
                <button onClick={() => toggle('uniformes')}
                    className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Shirt className="w-5 h-5 text-[#1e3166]" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-900 text-sm">Uniformes</p>
                            <p className="text-xs text-gray-500">{req.uniformes.length} artículos requeridos</p>
                        </div>
                    </div>
                    {openSection === 'uniformes'
                        ? <ChevronUp className="w-5 h-5 text-gray-400" />
                        : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {openSection === 'uniformes' && (
                    <div className="px-5 pb-5">
                        <div className="bg-blue-50/50 rounded-xl border border-blue-100/50 divide-y divide-blue-100/50">
                            {req.uniformes.map((u, i) => (
                                <div key={i} className="px-4 py-3 flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-2 min-w-0">
                                        <CheckCircle className="w-4 h-4 text-[#1e3166] shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">{u.item}</span>
                                    </div>
                                    {u.cantidad && (
                                        <span className="text-xs font-bold text-[#1e3166] bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
                                            x{u.cantidad}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 px-1">
                            Los uniformes con logo se adquieren en la tienda escolar o con proveedores autorizados.
                        </p>
                    </div>
                )}
            </div>

            {/* Libros y materiales */}
            <div>
                <button onClick={() => toggle('libros')}
                    className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-[#166534]" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-900 text-sm">Libros y materiales</p>
                            <p className="text-xs text-gray-500">{req.libros.length} artículos requeridos</p>
                        </div>
                    </div>
                    {openSection === 'libros'
                        ? <ChevronUp className="w-5 h-5 text-gray-400" />
                        : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {openSection === 'libros' && (
                    <div className="px-5 pb-5">
                        <div className="bg-green-50/50 rounded-xl border border-green-100/50 divide-y divide-green-100/50">
                            {req.libros.map((l, i) => (
                                <div key={i} className="px-4 py-3 flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-2 min-w-0">
                                        <CheckCircle className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">{l.item}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {l.nota && (
                                            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                                {l.nota}
                                            </span>
                                        )}
                                        {l.cantidad && (
                                            <span className="text-xs font-bold text-[#166534] bg-green-100 px-2 py-0.5 rounded-full">
                                                x{l.cantidad}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 px-1">
                            Los libros de la SEP se entregan gratuitamente al inicio del ciclo escolar.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
// ── History Row (expandable for store orders) ──
function HistoryRow({ h }) {
    const [expanded, setExpanded] = useState(false)
    const isStore = h.type === 'store'
    const hasItems = isStore && Array.isArray(h.items) && h.items.length > 0

    return (
        <div className={`transition-colors ${expanded ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
            <div
                className={`p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${hasItems ? 'cursor-pointer' : ''}`}
                onClick={() => hasItems && setExpanded(!expanded)}
            >
                <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isStore ? 'bg-blue-100' : 'bg-green-100'}`}>
                        {isStore ? (
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                        ) : (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm">{h.title || 'Pago'}</p>
                        <div className="flex items-center flex-wrap gap-2 mt-1 text-xs text-gray-500">
                            <span>{fmtDate(h.date)}</span>
                            <span>•</span>
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Folio #{h.folio}</span>
                            {isStore && (
                                <>
                                    <span>•</span>
                                    <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                        {h.status === 'delivered' ? 'Entregado' : 'Pendiente de entrega'}
                                    </span>
                                </>
                            )}
                        </div>
                        {hasItems && (
                            <button className="flex items-center gap-1 mt-2 text-xs font-semibold text-[#1e3166] hover:text-[#166534] transition-colors">
                                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                {expanded ? 'Ocultar desglose' : `Ver desglose (${h.items.length} artículo${h.items.length !== 1 ? 's' : ''})`}
                            </button>
                        )}
                    </div>
                </div>
                <div className="text-right pl-14 sm:pl-0">
                    <p className={`font-extrabold text-lg ${isStore ? 'text-[#1e3166]' : 'text-[#166534]'}`}>
                        ${(h.displayAmount || h.amount || 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Expandable item breakdown */}
            {expanded && hasItems && (
                <div className="px-4 sm:px-6 pb-5 pt-0">
                    <div className="ml-14 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="px-4 py-2.5 bg-gradient-to-r from-[#1e3166] to-[#243d80] flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-white/70" />
                            <span className="text-xs font-bold text-white/90">Desglose de artículos</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {h.items.map((item, idx) => (
                                <div key={idx} className="px-4 py-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {item.image && <span className="text-lg shrink-0">{item.image}</span>}
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {item.selectedSize && (
                                                    <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                        Talla: {item.selectedSize}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-gray-400">
                                                    ${(item.price || 0).toLocaleString()} × {item.qty}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-bold text-sm text-[#1e3166] whitespace-nowrap">
                                        ${((item.price || 0) * (item.qty || 1)).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-200">
                            <span className="text-xs font-bold text-gray-500">Total</span>
                            <span className="font-extrabold text-[#166534]">
                                ${(h.displayAmount || h.amount || 0).toLocaleString()} MXN
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Main Portal ──
export default function ParentPortal() {
    const [student, setStudent] = useState(null)
    const [history, setHistory] = useState([])
    const [token, setToken] = useState(null)
    const [portalTab, setPortalTab] = useState('cuenta')
    const [storeCart, setStoreCart] = useState({})
    const navigate = useNavigate()

    const goToPay = () => navigate('/pago', { state: { student, fromPortal: true } })

    // Restore session from sessionStorage
    useEffect(() => {
        const session = getParentSession()
        if (!session) return

        setToken(session.token)
        fetch(`${API_URL}/api/students/${session.studentId}`, {
            headers: { Authorization: `Bearer ${session.token}` },
        })
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(setStudent)
            .catch(() => {
                clearParentSession()
                setToken(null)
            })
    }, [])

    // Load payment history when student is available
    useEffect(() => {
        if (!student || !token) return
        fetch(`${API_URL}/api/payments/student/${student.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.ok ? r.json() : [])
            .then(setHistory)
            .catch(() => setHistory([]))
    }, [student, token])

    const handleLogin = (studentData, authToken) => {
        setStudent(studentData)
        setToken(authToken)
    }

    const logout = () => {
        clearParentSession()
        setStudent(null)
        setToken(null)
    }

    if (!student) return <ParentLogin onLogin={handleLogin} />

    const st = getTuitionStatus(student.ultimoPago)
    const tuition = getCurrentTuition(student.nivel)
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
                            <p className="text-xs text-gray-500 font-semibold tracking-wide">INSTITUTO EDUCATIVO ALEGRÍA</p>
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Tab Navigation ── */}
                <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                    {[
                        { id: 'cuenta', label: 'Mi Cuenta', icon: CreditCard },
                        { id: 'tienda', label: 'Tienda Escolar', icon: ShoppingCart },
                        { id: 'requisitos', label: 'Requisitos', icon: BookOpen },
                    ].map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setPortalTab(id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${portalTab === id
                                ? 'bg-[#1e3166] text-white shadow-md'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}>
                            <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>

                {/* ── TAB: Mi Cuenta ── */}
                {portalTab === 'cuenta' && (
                    <>
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
                                            {tuition?.isLate && (
                                                <p className="mt-2 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                                                    <strong>Nota:</strong> Este monto incluye recargo por pago extemporáneo (después del día 10).
                                                </p>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Último pago registrado</p>
                                        <p className="text-sm font-semibold text-gray-800">{fmtDate(student.ultimoPago)}</p>
                                    </div>
                                    <button onClick={goToPay} className="btn-primary py-2 px-4 shadow-none hover:shadow-md text-sm">
                                        {st.label === 'VIGENTE' ? 'Adelantar pago' : 'Pagar ahora'}
                                    </button>
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
                                        No hay movimientos registrados en línea para este alumno.
                                    </div>
                                ) : history.map(h => (
                                    <HistoryRow key={h.id} h={h} />
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ── TAB: Tienda Escolar ── */}
                {portalTab === 'tienda' && (
                    <SchoolStore nivel={student.nivel} studentName={`${student.nombre} ${student.apellido}`} studentId={student.id} cart={storeCart} setCart={setStoreCart} />
                )}

                {/* ── TAB: Requisitos ── */}
                {portalTab === 'requisitos' && (
                    <RequisitosSection nivel={student.nivel} />
                )}

            </main>
        </div>
    )
}
