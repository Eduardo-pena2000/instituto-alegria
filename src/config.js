// In production (monolith), API is on the same origin → empty string
// In dev, Vite proxy handles /api → no need for absolute URL either
export const API_URL = import.meta.env.VITE_API_URL || ''
export const STRIPE_PK = import.meta.env.VITE_STRIPE_PK
