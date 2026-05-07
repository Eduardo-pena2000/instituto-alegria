/**
 * Fuente única de verdad para los montos de colegiatura.
 * Se usa en rutas, servicios y webhook.
 */
/**
 * Fuente única de verdad para los montos de colegiatura.
 * Se usa en rutas, servicios y webhook.
 */

const BASE_RATES = {
    preescolar: { normal: 1500, late1: 1650, late2: 1800 },
    primaria: { normal: 2200, late1: 2350, late2: 2500 },
    secundaria: { normal: 2400, late1: 2550, late2: 2700 },
}

export function getCurrentTuition(level) {
    const day = new Date().getDate()
    const rates = BASE_RATES[level] || BASE_RATES.primaria // fallback

    if (day >= 1 && day <= 10) return rates.normal
    if (day >= 11 && day <= 20) return rates.late1
    return rates.late2
}

export function getCurrentTuitionCents(level) {
    return getCurrentTuition(level) * 100
}
