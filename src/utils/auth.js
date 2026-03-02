import { API_URL } from '../config'

function parseExpiry(exp) {
  const match = exp.match(/^(\d+)(h|m|d)$/)
  if (!match) return 8 * 60 * 60 * 1000
  const [, n, unit] = match
  const multipliers = { h: 3600000, m: 60000, d: 86400000 }
  return parseInt(n) * multipliers[unit]
}

export function getToken(key = 'iea_auth') {
  const data = sessionStorage.getItem(key)
  if (!data) return null
  try {
    const { token, expiresAt } = JSON.parse(data)
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem(key)
      return null
    }
    return token
  } catch {
    sessionStorage.removeItem(key)
    return null
  }
}

export function setToken(token, expiresIn = '8h', key = 'iea_auth') {
  const ms = parseExpiry(expiresIn)
  sessionStorage.setItem(key, JSON.stringify({
    token,
    expiresAt: Date.now() + ms,
  }))
}

export function clearToken(key = 'iea_auth') {
  sessionStorage.removeItem(key)
}

export function authHeaders(key = 'iea_auth') {
  const token = getToken(key)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch(path, options = {}, authKey = 'iea_auth') {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(authKey),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    clearToken(authKey)
  }

  return res
}
