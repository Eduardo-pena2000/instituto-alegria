import { useState, useEffect, useRef } from 'react'
import {
  Search, Plus, Edit2, Trash2, X, CreditCard, LogOut,
  Eye, CheckCircle, AlertCircle, Clock, Filter, ChevronUp,
  ChevronDown, User, Phone, Mail, MapPin, BookOpen, Lock,
  ShieldCheck, Users, AlertTriangle, Bell, Download,
  MessageCircle, RefreshCw, BarChart3, Calendar, Moon, Sun, Send, ArrowLeft
} from 'lucide-react'
import { INITIAL_STUDENTS, genId, daysAgo } from '../data'

/* ─── Helpers ─────────────────────────────────────────── */

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

const NIVEL_LABELS = { preescolar: 'Preescolar', primaria: 'Primaria', secundaria: 'Secundaria' }
const NIVEL_COLORS = {
  preescolar: 'bg-pink-100 text-pink-700',
  primaria: 'bg-blue-100 text-blue-700',
  secundaria: 'bg-emerald-100 text-emerald-700',
}

const EMPTY_FORM = {
  nombre: '', apellido: '', nivel: 'primaria', grado: '', grupo: 'A',
  fechaNacimiento: '', curp: '', nombrePadre: '', nombreMadre: '',
  telefono: '', email: '', direccion: '',
  fechaInscripcion: new Date().toISOString().split('T')[0],
  ultimoPago: new Date().toISOString().split('T')[0],
}

const TUITION = { preescolar: 1800, primaria: 2200, secundaria: 2500 }

function exportCSV(students) {
  const headers = 'Nombre,Apellido,Nivel,Grado,Grupo,CURP,Padre,Madre,Teléfono,Email,Último Pago,Estado\n'
  const rows = students.map(s => {
    const st = getTuitionStatus(s.ultimoPago)
    return `"${s.nombre}","${s.apellido}","${s.nivel}","${s.grado}","${s.grupo}","${s.curp}","${s.nombrePadre}","${s.nombreMadre}","${s.telefono}","${s.email}","${s.ultimoPago}","${st.label}"`
  }).join('\n')
  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `alumnos_iea_${new Date().toISOString().split('T')[0]}.csv`
  a.click(); URL.revokeObjectURL(url)
}

function sendWhatsApp(student) {
  const st = getTuitionStatus(student.ultimoPago)
  const amount = TUITION[student.nivel]
  const phone = student.telefono.replace(/\D/g, '')
  const msg = `Estimado(a) padre/madre de familia,%0A%0ALe informamos que la colegiatura de *${student.nombre} ${student.apellido}* (${student.nivel} ${student.grado}) se encuentra *${st.label}*.%0A%0AMonto: *$${amount.toLocaleString()} MXN*%0AÚltimo pago: ${fmtDate(student.ultimoPago)}%0A%0APuede realizar su pago en línea en nuestra página web.%0A%0AInstituto Educativo Alegría 📚`
  window.open(`https://wa.me/52${phone}?text=${msg}`, '_blank')
}

/* ─── Login ─────────────────────────────────────────── */
function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [shake, setShake] = useState(false)

  const handle = e => {
    e.preventDefault()
    if (user === 'admin' && pass === 'alegria2025') {
      onLogin()
    } else {
      setErr('Usuario o contraseña incorrectos.')
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #080e1c 0%, #1e3166 45%, #0d3a1a 100%)' }}>
      {/* Animated floating circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { w: 300, t: '-top-20', l: '-left-20', c: '#166534', o: 0.08, dur: '18s' },
          { w: 200, t: 'top-1/3', l: 'right-[-60px]', c: '#1e3166', o: 0.12, dur: '22s' },
          { w: 150, t: 'bottom-10', l: 'left-1/4', c: '#166534', o: 0.06, dur: '15s' },
          { w: 100, t: 'top-20', l: 'right-1/3', c: '#ffffff', o: 0.04, dur: '20s' },
        ].map((b, i) => (
          <div key={i} className={`absolute ${b.t} ${b.l} rounded-full`}
            style={{
              width: b.w, height: b.w, background: b.c, opacity: b.o,
              animation: `float${i} ${b.dur} ease-in-out infinite alternate`
            }} />
        ))}
      </div>
      <style>{`
        @keyframes float0 { from{transform:translate(0,0) scale(1)} to{transform:translate(40px,30px) scale(1.1)} }
        @keyframes float1 { from{transform:translate(0,0) scale(1)} to{transform:translate(-30px,50px) scale(0.9)} }
        @keyframes float2 { from{transform:translate(0,0) scale(1)} to{transform:translate(50px,-20px) scale(1.15)} }
        @keyframes float3 { from{transform:translate(0,0) scale(1)} to{transform:translate(-20px,40px) scale(0.95)} }
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
      `}</style>
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      {/* Card */}
      <div className={`relative w-full max-w-[400px] mx-4 ${shake ? '' : ''}`}
        style={shake ? { animation: 'shakeX 0.6s ease' } : {}}>
        <div className="rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] p-8 sm:p-10 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)' }}>
          {/* Logo + branding */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg ring-4 ring-[#1e3166]/10">
              <img src="/logo.jpg" alt="IEA" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#1e3166] tracking-tight">Panel Administrativo</h1>
            <p className="text-gray-400 text-sm mt-1 font-medium">Instituto Educativo Alegría Bilingüe</p>
            <div className="w-12 h-1 bg-gradient-to-r from-[#1e3166] to-[#166534] rounded-full mx-auto mt-3" />
          </div>

          <form onSubmit={handle} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Usuario</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1e3166] transition-colors" />
                <input type="text" value={user} onChange={e => { setUser(e.target.value); setErr('') }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1e3166] focus:bg-white text-sm font-medium text-gray-800 outline-none transition-all placeholder:text-gray-300"
                  placeholder="admin" autoComplete="username" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1e3166] transition-colors" />
                <input type="password" value={pass} onChange={e => { setPass(e.target.value); setErr('') }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1e3166] focus:bg-white text-sm font-medium text-gray-800 outline-none transition-all placeholder:text-gray-300"
                  placeholder="••••••••" autoComplete="current-password" />
              </div>
            </div>
            {err && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-3.5 border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" /> {err}
              </div>
            )}
            <button type="submit"
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #1e3166 0%, #166534 100%)' }}>
              Ingresar
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4">
            <a href="/" className="text-sm font-semibold text-[#1e3166] hover:text-[#166534] transition-colors flex items-center gap-1.5 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100/50 hover:shadow-md">
              <ArrowLeft className="w-4 h-4" />
              Volver al sitio web principal
            </a>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-300" />
              <p className="text-xs text-gray-300 font-medium">Acceso exclusivo personal autorizado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Sección helper ─────────────────────────────────────────── */
function Section({ title, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{title}</p>
      <p className="text-sm text-gray-800 font-medium mt-0.5">{value || '—'}</p>
    </div>
  )
}

/* ─── Modal alumno (add/edit) ─────────────────────────────────────────── */
function StudentModal({ student, onSave, onClose }) {
  const [form, setForm] = useState(student ? { ...student } : { ...EMPTY_FORM })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = e => {
    e.preventDefault()
    onSave(form)
  }

  const Field = ({ label, name, type = 'text', placeholder, required }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && ' *'}</label>
      <input
        type={type} value={form[name] || ''} onChange={e => set(name, e.target.value)}
        placeholder={placeholder} required={required} className="input-field text-sm"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {student ? 'Editar alumno' : 'Nuevo alumno'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Datos personales */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Datos del alumno</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre" name="nombre" required placeholder="Nombre(s)" />
              <Field label="Apellidos" name="apellido" required placeholder="Apellido paterno y materno" />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nivel *</label>
                <select value={form.nivel} onChange={e => set('nivel', e.target.value)} className="input-field text-sm" required>
                  <option value="preescolar">Preescolar</option>
                  <option value="primaria">Primaria</option>
                  <option value="secundaria">Secundaria</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Grado" name="grado" placeholder="1°, 2°..." required />
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Grupo</label>
                  <select value={form.grupo} onChange={e => set('grupo', e.target.value)} className="input-field text-sm">
                    {['A', 'B', 'C', 'D'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <Field label="Fecha de nacimiento" name="fechaNacimiento" type="date" />
              <Field label="CURP" name="curp" placeholder="CURP del alumno" />
            </div>
          </div>

          {/* Datos del tutor */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Datos del tutor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre del padre" name="nombrePadre" placeholder="Nombre completo" />
              <Field label="Nombre de la madre" name="nombreMadre" placeholder="Nombre completo" />
              <Field label="Teléfono" name="telefono" placeholder="(55) 1234-5678" required />
              <Field label="Correo electrónico" name="email" type="email" placeholder="correo@email.com" />
            </div>
            <div className="mt-4">
              <Field label="Dirección" name="direccion" placeholder="Calle, número, colonia" />
            </div>
          </div>

          {/* Datos escolares */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Datos escolares</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Fecha de inscripción" name="fechaInscripcion" type="date" required />
              <Field label="Último pago de colegiatura" name="ultimoPago" type="date" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              {student ? 'Guardar cambios' : 'Agregar alumno'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline px-6">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Modal detalle ─────────────────────────────────────────── */
function DetailModal({ student, onClose, onEdit, onPay }) {
  const status = getTuitionStatus(student.ultimoPago)
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{student.nombre} {student.apellido}</h2>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${NIVEL_COLORS[student.nivel]}`}>
              {NIVEL_LABELS[student.nivel]} · {student.grado} "{student.grupo}"
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado colegiatura */}
          <div className={`rounded-xl p-4 flex items-center gap-3 ${status.color} bg-opacity-20`}>
            <span className={`w-3 h-3 rounded-full ${status.dot} shrink-0`} />
            <div>
              <p className="font-bold text-sm">Colegiatura: {status.label}</p>
              <p className="text-xs opacity-75">Último pago: {fmtDate(student.ultimoPago)}</p>
            </div>
            {status.label !== 'VIGENTE' && (
              <button onClick={onPay} className="ml-auto btn-primary text-xs py-1.5 px-4">
                Registrar pago
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Section title="CURP" value={student.curp} />
            <Section title="Fecha de nacimiento" value={fmtDate(student.fechaNacimiento)} />
            <Section title="Nombre del padre" value={student.nombrePadre} />
            <Section title="Nombre de la madre" value={student.nombreMadre} />
            <Section title="Teléfono" value={student.telefono} />
            <Section title="Correo electrónico" value={student.email} />
            <div className="col-span-2">
              <Section title="Dirección" value={student.direccion} />
            </div>
            <Section title="Fecha de inscripción" value={fmtDate(student.fechaInscripcion)} />
            <Section title="Último pago" value={fmtDate(student.ultimoPago)} />
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onEdit} className="btn-outline flex items-center gap-2 text-sm">
            <Edit2 className="w-4 h-4" /> Editar
          </button>
          <button onClick={onPay} className="btn-primary flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4" /> Registrar pago
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Confirmación eliminar ─────────────────────────────────────────── */
function DeleteModal({ student, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar alumno?</h2>
        <p className="text-gray-500 text-sm mb-6">
          Se eliminará el registro de <strong>{student.nombre} {student.apellido}</strong>. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">Cancelar</button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Toast ─────────────────────────────────────────── */
function Toast({ message, type = 'success' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] font-semibold text-sm text-white ${type === 'success' ? '' : ''
      }`}
      style={{
        background: type === 'success'
          ? 'linear-gradient(135deg, #166534 0%, #22a84a 100%)'
          : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
        animation: 'slideInRight 0.4s ease-out'
      }}>
      <style>{`@keyframes slideInRight{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <CheckCircle className="w-4 h-4" />
      </div>
      {message}
    </div>
  )
}

/* ─── Panel principal ─────────────────────────────────────────── */
export default function Admin() {
  const [auth, setAuth] = useState(() => localStorage.getItem('iea_admin_auth') === 'true')
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('iea_students')
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS
  })

  const [search, setSearch] = useState('')
  const [filterNivel, setFilterNivel] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortField, setSortField] = useState('apellido')
  const [sortAsc, setSortAsc] = useState(true)

  const [modalAdd, setModalAdd] = useState(false)
  const [modalEdit, setModalEdit] = useState(null)
  const [modalDetail, setModalDetail] = useState(null)
  const [modalDelete, setModalDelete] = useState(null)
  const [toast, setToast] = useState(null)
  const [dark, setDark] = useState(false)
  const [tab, setTab] = useState('alumnos') // alumnos | reportes | calendario
  const [showNotif, setShowNotif] = useState(false)
  const [paymentHistory, setPaymentHistory] = useState(() => {
    const saved = localStorage.getItem('iea_payment_history')
    return saved ? JSON.parse(saved) : []
  })

  /* Persist to localStorage */
  useEffect(() => {
    localStorage.setItem('iea_students', JSON.stringify(students))
  }, [students])
  useEffect(() => {
    localStorage.setItem('iea_payment_history', JSON.stringify(paymentHistory))
  }, [paymentHistory])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  /* ── Auth ── */
  const login = () => {
    localStorage.setItem('iea_admin_auth', 'true')
    setAuth(true)
  }
  const logout = () => {
    localStorage.removeItem('iea_admin_auth')
    setAuth(false)
  }
  const resetDemo = () => {
    localStorage.removeItem('iea_students')
    localStorage.removeItem('iea_payment_history')
    setStudents(INITIAL_STUDENTS)
    setPaymentHistory([])
    showToast('Datos de demo restaurados')
  }

  if (!auth) return <LoginScreen onLogin={login} />

  /* ── Stats ── */
  const total = students.length
  const vigentes = students.filter(s => getTuitionStatus(s.ultimoPago).label === 'VIGENTE').length
  const porVencer = students.filter(s => getTuitionStatus(s.ultimoPago).label === 'POR VENCER').length
  const vencidas = students.filter(s => getTuitionStatus(s.ultimoPago).label === 'VENCIDA').length

  /* ── Filters + Sort ── */
  const filtered = students
    .filter(s => {
      const q = search.toLowerCase()
      const matchQ = !q ||
        s.nombre.toLowerCase().includes(q) ||
        s.apellido.toLowerCase().includes(q) ||
        s.telefono.includes(q) ||
        (s.email || '').toLowerCase().includes(q)
      const matchN = filterNivel === 'all' || s.nivel === filterNivel
      const matchS = filterStatus === 'all' || getTuitionStatus(s.ultimoPago).label === filterStatus
      return matchQ && matchN && matchS
    })
    .sort((a, b) => {
      let va = a[sortField] || ''
      let vb = b[sortField] || ''
      if (sortField === 'status') {
        va = getTuitionStatus(a.ultimoPago).order
        vb = getTuitionStatus(b.ultimoPago).order
        return sortAsc ? va - vb : vb - va
      }
      return sortAsc
        ? va.localeCompare(vb)
        : vb.localeCompare(va)
    })

  const toggleSort = field => {
    if (sortField === field) setSortAsc(a => !a)
    else { setSortField(field); setSortAsc(true) }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 text-gray-300" />
    return sortAsc
      ? <ChevronUp className="w-3 h-3 text-[#1e3166]" />
      : <ChevronDown className="w-3 h-3 text-[#1e3166]" />
  }

  /* ── CRUD ── */
  const addStudent = form => {
    setStudents(prev => [{ ...form, id: genId() }, ...prev])
    setModalAdd(false)
    showToast('Alumno agregado correctamente')
  }

  const editStudent = form => {
    setStudents(prev => prev.map(s => s.id === form.id ? form : s))
    setModalEdit(null)
    setModalDetail(null)
    showToast('Datos actualizados')
  }

  const deleteStudent = id => {
    setStudents(prev => prev.filter(s => s.id !== id))
    setModalDelete(null)
    setModalDetail(null)
    showToast('Alumno eliminado', 'error')
  }

  const registerPayment = id => {
    const today = new Date().toISOString().split('T')[0]
    const student = students.find(s => s.id === id)
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ultimoPago: today } : s))
    setModalDetail(prev => prev ? { ...prev, ultimoPago: today } : null)
    if (student) {
      setPaymentHistory(prev => [{
        id: genId(), studentId: id, studentName: `${student.nombre} ${student.apellido}`,
        nivel: student.nivel, amount: TUITION[student.nivel], date: today,
        folio: Math.random().toString(36).slice(2, 10).toUpperCase()
      }, ...prev])
    }
    showToast('Pago registrado — colegiatura VIGENTE')
  }

  /* ── Render ── */
  const bg = dark ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 shadow-xl" style={{ background: 'linear-gradient(135deg, #0e1630 0%, #1e3166 60%, #132a14 100%)' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl overflow-hidden ring-2 ring-white/15 shadow-lg">
              <img src="/logo.jpg" alt="IEA" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight tracking-wide">Panel de Administración</p>
              <p className="text-blue-200/50 text-[11px] font-medium">Instituto Educativo Alegría · Valores para VIVIR</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notification bell */}
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className="p-2 text-blue-200/70 hover:text-white hover:bg-white/10 rounded-lg transition-all relative">
                <Bell className="w-4 h-4" />
                {vencidas > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">{vencidas}</span>}
              </button>
              {showNotif && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs font-bold text-gray-700">Notificaciones</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {vencidas > 0 && <div className="p-3 border-b border-gray-50 flex items-start gap-2"><AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><p className="text-xs text-gray-600"><strong className="text-red-600">{vencidas} alumno{vencidas > 1 ? 's' : ''}</strong> con colegiatura vencida</p></div>}
                    {porVencer > 0 && <div className="p-3 border-b border-gray-50 flex items-start gap-2"><Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /><p className="text-xs text-gray-600"><strong className="text-amber-600">{porVencer} alumno{porVencer > 1 ? 's' : ''}</strong> por vencer esta semana</p></div>}
                    {vencidas === 0 && porVencer === 0 && <div className="p-4 text-center text-xs text-gray-400">Sin alertas pendientes ✅</div>}
                  </div>
                </div>
              )}
            </div>
            {/* Dark mode */}
            <button onClick={() => setDark(!dark)} className="p-2 text-blue-200/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title={dark ? 'Modo claro' : 'Modo oscuro'}>
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Reset demo */}
            <button onClick={resetDemo} className="p-2 text-blue-200/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Restaurar datos de demo">
              <RefreshCw className="w-4 h-4" />
            </button>
            {/* Export CSV */}
            <button onClick={() => { exportCSV(students); showToast('Archivo CSV descargado') }} className="hidden sm:flex items-center gap-1.5 text-blue-200/70 hover:text-white hover:bg-white/10 px-2.5 py-2 rounded-lg transition-all text-xs font-medium">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button onClick={logout} className="flex items-center gap-2 text-blue-200/70 hover:text-white text-sm transition-all duration-200 hover:bg-white/10 px-3 py-2 rounded-lg">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Welcome banner */}
        <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3166 0%, #243d80 50%, #1a5a2f 100%)' }}>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">¡Bienvenido, Administrador!</h1>
              <p className="text-blue-200/60 text-sm mt-1">Gestiona a los alumnos del Instituto Educativo Alegría desde este panel.</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm border border-white/10">
              <BookOpen className="w-4 h-4 text-green-300/80" />
              <span className="text-white/80 text-sm font-medium">{total} alumnos registrados</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          {[
            { id: 'alumnos', label: 'Alumnos', icon: Users },
            { id: 'reportes', label: 'Reportes', icon: BarChart3 },
            { id: 'calendario', label: 'Calendario', icon: Calendar },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === id
                ? 'bg-[#1e3166] text-white shadow-md'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {tab === 'alumnos' && (<>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total alumnos', value: total, icon: Users, gradient: 'from-[#1e3166] to-[#2d4a9e]', ring: 'ring-blue-100', bg: 'bg-blue-50/50', border: 'border-blue-100', valueColor: 'text-[#1e3166]' },
              { label: 'Vigentes', value: vigentes, icon: CheckCircle, gradient: 'from-[#166534] to-[#22a84a]', ring: 'ring-green-100', bg: 'bg-green-50/50', border: 'border-green-100', valueColor: 'text-[#166534]' },
              { label: 'Por vencer', value: porVencer, icon: Clock, gradient: 'from-amber-600 to-amber-400', ring: 'ring-amber-100', bg: 'bg-amber-50/50', border: 'border-amber-100', valueColor: 'text-amber-700' },
              { label: 'Vencidas', value: vencidas, icon: AlertCircle, gradient: 'from-red-600 to-red-400', ring: 'ring-red-100', bg: 'bg-red-50/50', border: 'border-red-100', valueColor: 'text-red-600' },
            ].map(({ label, value, icon: Icon, gradient, ring, bg, border, valueColor }) => (
              <div key={label} className={`${bg} border ${border} rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</p>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md ${ring} ring-2 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className={`text-4xl font-extrabold ${valueColor} tracking-tight`}>{value}</p>
                {label === 'Total alumnos' && <p className="text-xs text-gray-400 mt-1">en todos los niveles</p>}
                {label === 'Vigentes' && <p className="text-xs text-gray-400 mt-1">{total ? Math.round(vigentes / total * 100) : 0}% del total</p>}
                {label === 'Por vencer' && porVencer > 0 && <p className="text-xs text-amber-500 mt-1 font-medium">⚠ Requieren atención</p>}
                {label === 'Vencidas' && vencidas > 0 && <p className="text-xs text-red-500 mt-1 font-medium">⚠ Notificar familias</p>}
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-48 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1e3166] transition-colors" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre, teléfono o correo..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1e3166] focus:bg-white text-sm outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Filtro nivel */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select value={filterNivel} onChange={e => setFilterNivel(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1e3166] text-sm outline-none transition-all appearance-none cursor-pointer">
                <option value="all">Todos los niveles</option>
                <option value="preescolar">Preescolar</option>
                <option value="primaria">Primaria</option>
                <option value="secundaria">Secundaria</option>
              </select>
            </div>

            {/* Filtro estado */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="py-2.5 px-3 pr-8 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1e3166] text-sm outline-none transition-all appearance-none cursor-pointer">
              <option value="all">Todos los estados</option>
              <option value="VIGENTE">Vigente</option>
              <option value="POR VENCER">Por vencer</option>
              <option value="VENCIDA">Vencida</option>
            </select>

            {/* Botón agregar */}
            <button
              onClick={() => setModalAdd(true)}
              className="flex items-center gap-2 text-sm whitespace-nowrap ml-auto text-white font-bold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #1e3166 0%, #166534 100%)' }}
            >
              <Plus className="w-4 h-4" />
              Nuevo alumno
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-50/80 border-b border-gray-100">
                  <tr>
                    {[
                      { label: 'Alumno', field: 'apellido' },
                      { label: 'Nivel / Grado', field: 'nivel' },
                      { label: 'Tutor', field: 'nombrePadre' },
                      { label: 'Teléfono', field: null },
                      { label: 'Último pago', field: 'ultimoPago' },
                      { label: 'Estado', field: 'status' },
                      { label: 'Acciones', field: null },
                    ].map(({ label, field }) => (
                      <th
                        key={label}
                        onClick={field ? () => toggleSort(field) : undefined}
                        className={`text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap ${field ? 'cursor-pointer hover:text-gray-700 select-none' : ''}`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {label}
                          {field && <SortIcon field={field} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No se encontraron alumnos
                      </td>
                    </tr>
                  ) : filtered.map(s => {
                    const st = getTuitionStatus(s.ultimoPago)
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        {/* Nombre */}
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{s.nombre} {s.apellido}</p>
                          <p className="text-xs text-gray-400">{s.curp}</p>
                        </td>
                        {/* Nivel */}
                        <td className="px-4 py-3">
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${NIVEL_COLORS[s.nivel]}`}>
                            {NIVEL_LABELS[s.nivel]}
                          </span>
                          <p className="text-xs text-gray-500 mt-0.5">{s.grado} "{s.grupo}"</p>
                        </td>
                        {/* Tutor */}
                        <td className="px-4 py-3">
                          <p className="text-gray-700">{s.nombrePadre || s.nombreMadre || '—'}</p>
                        </td>
                        {/* Teléfono */}
                        <td className="px-4 py-3 text-gray-600">{s.telefono}</td>
                        {/* Último pago */}
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(s.ultimoPago)}</td>
                        {/* Estado */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${st.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </td>
                        {/* Acciones */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setModalDetail(s)}
                              title="Ver detalle"
                              className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setModalEdit(s)}
                              title="Editar"
                              className="p-1.5 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => registerPayment(s.id)}
                              title="Registrar pago"
                              className="p-1.5 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setModalDelete(s)}
                              title="Eliminar"
                              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => sendWhatsApp(s)}
                              title="Enviar recordatorio WhatsApp"
                              className="p-1.5 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="px-5 py-3.5 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white text-xs text-gray-400 flex items-center justify-between">
                <span>Mostrando <strong className="text-gray-600">{filtered.length}</strong> de <strong className="text-gray-600">{total}</strong> alumnos</span>
                <span className="text-[10px] text-gray-300">Instituto Educativo Alegría · Panel Admin</span>
              </div>
            )}
          </div>
        </>)}

        {/* ═══ REPORTES TAB ═══ */}
        {tab === 'reportes' && (
          <div className="space-y-6">
            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Donut chart - Students by level */}
              <div className={`${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border p-6`}>
                <h3 className={`font-bold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Alumnos por nivel</h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="relative w-36 h-36">
                    {(() => {
                      const pre = students.filter(s => s.nivel === 'preescolar').length
                      const pri = students.filter(s => s.nivel === 'primaria').length
                      const sec = students.filter(s => s.nivel === 'secundaria').length
                      const t = pre + pri + sec || 1
                      const p1 = (pre / t) * 100
                      const p2 = (pri / t) * 100
                      return (
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f9a8d4" strokeWidth="3" strokeDasharray={`${p1} ${100 - p1}`} strokeDashoffset="0" />
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#93c5fd" strokeWidth="3" strokeDasharray={`${p2} ${100 - p2}`} strokeDashoffset={`${-p1}`} />
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6ee7b7" strokeWidth="3" strokeDasharray={`${100 - p1 - p2} ${p1 + p2}`} strokeDashoffset={`${-(p1 + p2)}`} />
                          <text x="18" y="19" textAnchor="middle" className="fill-gray-800 text-[6px] font-bold rotate-90 origin-center">{t}</text>
                        </svg>
                      )
                    })()}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-pink-300" /><span className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>Preescolar ({students.filter(s => s.nivel === 'preescolar').length})</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-300" /><span className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>Primaria ({students.filter(s => s.nivel === 'primaria').length})</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-300" /><span className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>Secundaria ({students.filter(s => s.nivel === 'secundaria').length})</span></div>
                  </div>
                </div>
              </div>
              {/* Bar chart - Tuition status */}
              <div className={`${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border p-6`}>
                <h3 className={`font-bold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Estado de colegiaturas</h3>
                <div className="space-y-4 mt-6">
                  {[
                    { label: 'Vigentes', value: vigentes, max: total, color: 'bg-green-500' },
                    { label: 'Por vencer', value: porVencer, max: total, color: 'bg-amber-500' },
                    { label: 'Vencidas', value: vencidas, max: total, color: 'bg-red-500' },
                  ].map(({ label, value, max, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={dark ? 'text-gray-300' : 'text-gray-600'}>{label}</span>
                        <span className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</span>
                      </div>
                      <div className={`h-3 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden`}>
                        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue + Payment History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue summary */}
              <div className={`${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border p-6`}>
                <h3 className={`font-bold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Ingresos estimados</h3>
                <div className="space-y-3">
                  {['preescolar', 'primaria', 'secundaria'].map(n => {
                    const count = students.filter(s => s.nivel === n).length
                    return (
                      <div key={n} className="flex justify-between items-center">
                        <span className={`text-sm capitalize ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{n} ({count})</span>
                        <span className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>${(TUITION[n] * count).toLocaleString()}</span>
                      </div>
                    )
                  })}
                  <hr className={dark ? 'border-gray-700' : 'border-gray-100'} />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[#166534]">Total mensual</span>
                    <span className="font-extrabold text-lg text-[#166534]">${students.reduce((s, st) => s + TUITION[st.nivel], 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {/* Recent payments */}
              <div className={`lg:col-span-2 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border p-6`}>
                <h3 className={`font-bold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Historial de pagos recientes</h3>
                {paymentHistory.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">No hay pagos registrados aún</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {paymentHistory.slice(0, 10).map(p => (
                      <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl ${dark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div>
                          <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>{p.studentName}</p>
                          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-400'}`}>{fmtDate(p.date)} · Folio #{p.folio}</p>
                        </div>
                        <span className="font-bold text-sm text-[#166534]">${p.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ CALENDARIO TAB ═══ */}
        {tab === 'calendario' && (
          <div className={`${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border p-6`}>
            <h3 className={`font-bold text-sm mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>Próximos vencimientos de colegiatura</h3>
            <div className="space-y-2">
              {students
                .map(s => {
                  const venc = new Date(s.ultimoPago)
                  venc.setDate(venc.getDate() + 30)
                  const st = getTuitionStatus(s.ultimoPago)
                  return { ...s, venc, st }
                })
                .sort((a, b) => a.venc - b.venc)
                .map(s => (
                  <div key={s.id} className={`flex items-center gap-4 p-3 rounded-xl ${dark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold shrink-0 ${s.st.label === 'VENCIDA' ? 'bg-red-100 text-red-700' :
                      s.st.label === 'POR VENCER' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                      <span className="text-[10px] uppercase">{s.venc.toLocaleDateString('es-MX', { month: 'short' })}</span>
                      <span className="text-base leading-none">{s.venc.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>{s.nombre} {s.apellido}</p>
                      <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-400'}`}>{NIVEL_LABELS[s.nivel]} · {s.grado} "{s.grupo}"</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${s.st.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.st.dot}`} />{s.st.label}
                    </span>
                    <span className={`text-sm font-bold ${dark ? 'text-gray-300' : 'text-gray-700'}`}>${TUITION[s.nivel]?.toLocaleString()}</span>
                    <button onClick={() => sendWhatsApp(s)} title="WhatsApp" className="p-1.5 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-lg transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      {modalAdd && <StudentModal onSave={addStudent} onClose={() => setModalAdd(false)} />}
      {modalEdit && <StudentModal student={modalEdit} onSave={editStudent} onClose={() => setModalEdit(null)} />}
      {modalDetail && (
        <DetailModal
          student={modalDetail}
          onClose={() => setModalDetail(null)}
          onEdit={() => { setModalEdit(modalDetail); setModalDetail(null) }}
          onPay={() => registerPayment(modalDetail.id)}
        />
      )}
      {modalDelete && (
        <DeleteModal
          student={modalDelete}
          onConfirm={() => deleteStudent(modalDelete.id)}
          onClose={() => setModalDelete(null)}
        />
      )}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
