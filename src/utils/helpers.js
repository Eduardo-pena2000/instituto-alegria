/* ─── Shared Helper Functions ─────────────────────────── */

/**
 * Calcula el estado de la colegiatura basado en la fecha del último pago.
 * Si han pasado más de 30 días, está VENCIDA.
 * Si faltan 5 días o menos, está POR VENCER.
 * De lo contrario, está VIGENTE.
 */
export function getTuitionStatus(ultimoPago) {
    if (!ultimoPago) return { label: 'VENCIDA', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', order: 2 }
    const venc = new Date(ultimoPago)
    venc.setDate(venc.getDate() + 30)
    const hoy = new Date()
    const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24))
    if (hoy > venc) return { label: 'VENCIDA', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', order: 2 }
    if (diff <= 5) return { label: 'POR VENCER', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', order: 1 }
    return { label: 'VIGENTE', color: 'bg-green-100 text-green-700', dot: 'bg-green-500', order: 0 }
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD) al formato dd/mm/yyyy.
 */
export function fmtDate(iso) {
    if (!iso) return '—'
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
}

/**
 * Genera un ID único usando crypto.randomUUID().
 */
export function genId() {
    return crypto.randomUUID()
}

/**
 * Calcula una fecha relativa a hoy (n días atrás) en formato ISO.
 */
export function daysAgo(n) {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().split('T')[0]
}
