import API from './components/axios.js'
import React, { useContext, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserContext } from './components/context/userContext'

const ChangePassword = () => {
  const { state } = useLocation()
  const [userData, setUserData] = useState({
    otp: state?.otp || '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setCurrentUser } = useContext(UserContext)

  const changeInputHandler = (e) => {
    setUserData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setError('')

    if (userData.newPassword !== userData.confirmPassword) {
      return setError('Passwords do not match')
    }

    try {
      const response = await API.post('/users/reset-password', userData)
      setCurrentUser(response?.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred')
    }
  }

  return (
    <section className="register">
      <div className="container">
        <h2>New Password</h2>
        <form className="form login__form" onSubmit={changePassword}>
          {error && <p className="form__error-message">{error}</p>}
          <input type="password" placeholder='New Password' name='newPassword' value={userData.newPassword} onChange={changeInputHandler} />
          <input type="password" placeholder='Confirm Password' name='confirmPassword' value={userData.confirmPassword} onChange={changeInputHandler} />
          <button type="submit" className='btn primary'>Change Password</button>
        </form>
      </div>
    </section>
  )
}
export default ChangePassword