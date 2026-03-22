import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from './components/context/userContext'
import { clearTokenExpiry } from './components/utils/tokenScheduler'
import API from './components/axios.js'

const Logout = () => {
  const { setCurrentUser } = useContext(UserContext)
  const navigate = useNavigate()

  useEffect(() => {
    // Clear state and navigate immediately — don't wait for backend
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
    clearTokenExpiry()
    navigate('/login')

    // Fire backend logout in background — don't await
    API.post('/users/logout').catch(() => {})
  }, [])

  return <></>
}

export default Logout