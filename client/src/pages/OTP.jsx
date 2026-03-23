import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API from './components/axios'
import OtpInput from './components/OtpInput'
import { useSearchParams } from 'react-router-dom'

import { MdMarkEmailRead } from "react-icons/md";

const OTP = () => {
  const [searchParams] = useSearchParams()
  const codeFromEmail = searchParams.get('code')
  const [otp, setOtp] = useState(codeFromEmail || '')
  const [error, setError] = useState('')
  const [verifying, setVerifying]   = useState(false)
  const navigate = useNavigate()
  const { state } = useLocation()

  const submitOTP = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    setError('')
    setVerifying(true)
    const otpToSubmit = otp || codeFromEmail
    console.log('Submitting OTP:', otpToSubmit)
    try {
      await API.post('/users/verify-otp', { otp: otpToSubmit })
      navigate('/changePassword', { state: { otp: otpToSubmit } })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred')
    } finally {
      setVerifying(false)
    }
  }

  useEffect(() => {
    if (codeFromEmail && codeFromEmail.length === 6) {
      submitOTP()
    }
  }, [codeFromEmail])

  return (
    <section className="register">
      <div className="container">
        <h2>Enter OTP</h2>
        <p className='form__success-message'><MdMarkEmailRead /> We sent a code to {state?.email}</p>
        <form className="form login__form" onSubmit={submitOTP}>
          {error && <p className="form__error-message">{error}</p>}
          <OtpInput length={6} onChange={setOtp} />
          <button type="submit" className='btn primary' disabled={verifying}
            style={{ opacity: verifying ? 0.75 : 1, transition: 'opacity 0.2s ease' }}>
            { verifying ? 'Verifying...' : 'Verify  OTP' }
          </button>
        </form>
      </div>
    </section>
  )
}

export default OTP