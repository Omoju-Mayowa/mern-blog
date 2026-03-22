import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// How long the access token lives (must match backend — 15m)
const ACCESS_TOKEN_TTL = 15 * 60 * 1000

// Refresh 60 seconds before expiry so there's always headroom
const REFRESH_BUFFER = 2 * 60 * 1000

let refreshTimer = null

/**
 * Call this after login or on app boot.
 * Stores the expiry time and schedules a silent refresh before it hits.
 */
export const scheduleRefresh = (expiresAt = null) => {
  // Clear any existing timer first
  cancelRefresh()

  // If no expiresAt passed, calculate from now
  const expiry = expiresAt || Date.now() + ACCESS_TOKEN_TTL
  localStorage.setItem('tokenExpiry', String(expiry))

  const delay = expiry - Date.now() - REFRESH_BUFFER

  if (delay <= 0) {
    // Already expired or about to — refresh immediately
    performRefresh()
    return
  }

  refreshTimer = setTimeout(() => {
    performRefresh()
  }, delay)
}

/**
 * Silently hits /users/refresh and reschedules.
 * If it fails, clears everything — interceptor handles the fallback.
 */
const performRefresh = async () => {
  try {
    await axios.post(
      `${BASE_URL}/users/refresh`,
      {},
      { withCredentials: true }
    )
    // Refresh succeeded — store new expiry and reschedule
    const newExpiry = Date.now() + ACCESS_TOKEN_TTL
    scheduleRefresh(newExpiry)
  } catch {
    // Refresh token expired or invalid
    // Clear everything — let the interceptor redirect to login
    clearTokenExpiry()
  }
}

/**
 * Call on logout or when session ends.
 */
export const cancelRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

export const clearTokenExpiry = () => {
  localStorage.removeItem('tokenExpiry')
  cancelRefresh()
}

/**
 * Returns true if the stored token should still be valid.
 * Used by the interceptor to skip unnecessary refresh calls.
 */
export const isTokenFresh = () => {
  const expiry = parseInt(localStorage.getItem('tokenExpiry') || '0')
  return expiry > Date.now() + 5000 // 5s grace period
}