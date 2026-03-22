import axios from 'axios'
import { isTokenFresh, scheduleRefresh, clearTokenExpiry } from './utils/tokenScheduler'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
})

let isRefreshing = false
let failedQueue  = []

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve()
  })
  failedQueue = []
}

const isPublicRequest = (url = '', method = '') => {
  const m = method.toLowerCase()
  return url.includes('/users/login')           ||
         url.includes('/users/register')        ||
         url.includes('/users/refresh')         ||
         url.includes('/users/verify-otp')      ||
         url.includes('/users/reset-password')  ||
         url.includes('/users/forgot-password') ||
         url.includes('/users/me')              ||
         url.includes('/otp')                   ||
         url.includes('code=')                  ||
         (url.includes('/posts') && m === 'get')||
         (url.includes('/users') && m === 'get')
}

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const url      = originalRequest?.url || ''
    const method   = originalRequest?.method || ''
    const isPublic = isPublicRequest(url, method)

    // Public routes — never intercept, just reject
    if (isPublic) return Promise.reject(error)

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Fast path: token fresh — retry directly
      if (isTokenFresh()) {
        originalRequest._retry = true
        return API(originalRequest)
      }

      // Slow path: try refresh
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => API(originalRequest)).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/users/refresh`,
          {},
          { withCredentials: true }
        )
        scheduleRefresh()
        processQueue(null)
        isRefreshing = false
        return API(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        isRefreshing = false
        localStorage.removeItem('currentUser')
        clearTokenExpiry()

        // Only redirect if user was previously logged in
        const wasLoggedIn = !!localStorage.getItem('currentUser')
        if (wasLoggedIn && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?error=expired'
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default API