/**
 * Fuente única de verdad para los montos de colegiatura.
 * Se usa en rutas, servicios y webhook.
 */
export const TUITION = {
    preescolar: 1800,
    primaria: 2200,
    secundaria: 2500,
}

/** Montos en centavos (para Stripe) */
export const TUITION_CENTS = {
    preescolar: 180000,
    primaria: 220000,
    secundaria: 250000,
}
