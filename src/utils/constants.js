/* ─── Shared Constants ─────────────────────────────────── */

const BASE_RATES = {
    preescolar: { normal: 1500, late1: 1650, late2: 1800, label: 'Preescolar' },
    primaria: { normal: 2200, late1: 2350, late2: 2500, label: 'Primaria' },
    secundaria: { normal: 2400, late1: 2550, late2: 2700, label: 'Secundaria' },
}

export function getCurrentTuition(level) {
    const day = new Date().getDate()
    const rates = BASE_RATES[level] || BASE_RATES.primaria // fallback

    let amount = rates.normal
    let isLate = false

    if (day > 10 && day <= 20) {
        amount = rates.late1
        isLate = true
    } else if (day > 20) {
        amount = rates.late2
        isLate = true
    }

    return {
        label: rates.label,
        amount,
        display: `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN`,
        isLate,
        original: rates.normal,
    }
}

export const NIVEL_LABELS = {
    preescolar: 'Preescolar',
    primaria: 'Primaria',
    secundaria: 'Secundaria',
}

export const NIVEL_COLORS = {
    preescolar: 'bg-pink-100 text-pink-700',
    primaria: 'bg-blue-100 text-blue-700',
    secundaria: 'bg-emerald-100 text-emerald-700',
}
