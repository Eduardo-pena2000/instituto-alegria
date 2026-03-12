/**
 * Shared helper functions for the server.
 * These are the server-side equivalents of src/utils/helpers.js
 */

export function getTuitionStatus(ultimoPago) {
    if (!ultimoPago) return { label: 'VENCIDA', type: 'vencida' }
    const venc = new Date(ultimoPago)
    venc.setDate(venc.getDate() + 30)
    const hoy = new Date()
    const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24))
    if (hoy > venc) return { label: 'VENCIDA', type: 'vencida' }
    if (diff <= 5) return { label: 'POR VENCER', type: 'por_vencer' }
    return { label: 'VIGENTE', type: 'vigente' }
}

export function fmtDate(iso) {
    if (!iso) return '—'
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
}

export function daysAgo(n) {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().split('T')[0]
}
