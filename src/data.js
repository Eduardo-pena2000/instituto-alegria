/* ─── Helpers ─────────────────────────────────────────── */
export function genId() {
    return crypto.randomUUID()
}

/* Calcular fecha relativa a hoy */
export function daysAgo(n) {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().split('T')[0]
}
