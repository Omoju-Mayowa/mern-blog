import { createContext, useEffect, useState } from 'react'
import API from '../axios'
import { scheduleRefresh, cancelRefresh, clearTokenExpiry } from '../utils/tokenScheduler'
import { CARD_DEFAULT_ORDER } from '../postLayoutConstants'

export const UserContext = createContext()

const CARD_STORAGE_KEY = 'postCardLayoutOrder'

const loadCardOrder = () => {
  try {
    const stored = localStorage.getItem(CARD_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (
        Array.isArray(parsed) &&
        parsed.length === CARD_DEFAULT_ORDER.length &&
        CARD_DEFAULT_ORDER.every(s => parsed.includes(s))
      ) return parsed
    }
  } catch { }
  return [...CARD_DEFAULT_ORDER]
}

const saveCardOrder = (order) => {
  try { localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(order)) } catch { }
}

const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading]     = useState(true)
  const [cardOrder, setCardOrder] = useState(loadCardOrder)

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [currentUser])

  useEffect(() => {
    const validateSess = async () => {
      try {
        const res = await API.get('/users/me')
        setCurrentUser(res.data)
        scheduleRefresh()
      } catch {
        // /users/me failed — try to refresh first, then retry
        try {
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/users/refresh`,
            {},
            { withCredentials: true }
          )
          // Refresh succeeded — now try /users/me again
          const res = await API.get('/users/me')
          setCurrentUser(res.data)
          scheduleRefresh()
        } catch {
          // Refresh also failed — genuinely not logged in
          setCurrentUser(null)
          clearTokenExpiry()
        }
      } finally {
        setLoading(false)
      }
    }
    validateSess()
    return () => cancelRefresh()
  }, [])

  const updateCardOrder = (order) => {
    setCardOrder(order)
    saveCardOrder(order)
  }

  const resetCardOrder = () => {
    setCardOrder([...CARD_DEFAULT_ORDER])
    saveCardOrder([...CARD_DEFAULT_ORDER])
  }

  const logout = async () => {
    try { await API.post('/users/logout') } catch { }
    finally {
      setCurrentUser(null)
      localStorage.removeItem('currentUser')
      clearTokenExpiry()
    }
  }

  return (
    <UserContext.Provider value={{
      currentUser, setCurrentUser,
      loading, logout,
      cardOrder, updateCardOrder, resetCardOrder,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider