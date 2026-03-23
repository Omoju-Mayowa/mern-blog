import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from './components/axios.js'
import { UserContext } from './components/context/userContext';

const scrollTop = () => {
  window.scrollTo(0, 0);
}

const ForgotPassword = () => {
  const[userData, setUserData] = useState({
    email : '',
  })

  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()
  
  const {setCurrentUser} = useContext(UserContext)

  const forgotUser = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      const response = await API.post(`/users/forgot-password`, userData)
      // OTP request succeeded; do not set currentUser here (we only requested an OTP)
      navigate('/otp', { state: { email: userData.email } })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred')
    } finally {
      setSending(true)
    }
  }


  const changeInputHandler = (e) => {
    setUserData(prevState => {
      return{...prevState, [e.target.name]: e.target.value}
    })
  }

  return (
    <section className="register">
      <div className="container">
        <h2>Sign Up</h2>
        <form className="form login__form" onSubmit={forgotUser}>
          {error && <p className="form__error-message">{error}</p>}
          <input type="email" placeholder='Enter your Email' name='email' value={userData.email} onChange={changeInputHandler} />
          <button type="submit" className='btn primary' onClick={scrollTop} disabled={sending}
            style={{ opacity: sending ? 0.75 : 1, transition: 'opacity 0.2s ease' }}
          >
            { sending ? 'Sending...' : 'Request OTP' }
          </button>
        </form>
      </div>
    </section>
  )
}

export default ForgotPassword