import React, { useContext, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import API from './components/axios.js'
import { UserContext } from './components/context/userContext'

const DeletePost = ({ postId }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useContext(UserContext)

  const closeModal = () => { setShowModal(false); setError('') }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')
    try {
      await API.delete(`/posts/${postId}`)
      setShowModal(false)
      if (location.pathname.includes('myposts') || location.pathname.includes('dashboard')) {
        window.location.reload()
      } else {
        navigate('/')
      }
    } catch (err) {
      console.error(err)
      setError('Could not delete post. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button className='btn danger' onClick={() => setShowModal(true)}>
        Delete
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000,
              transition: 'backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease'
            }}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '2rem',
                width: '100%',
                maxWidth: '420px',
                margin: '0 1rem',
              }}
            >
              {/* Trash Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                style={{
                  width: '48px', height: '48px',
                  borderRadius: '50%',
                  background: 'var(--color-red-10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </motion.div>

              <h3 style={{ margin: '0 0 0.5rem', fontSize: '18px', color: '#0c0c22', fontWeight: 700 }}>
                Delete post
              </h3>
              <p style={{ margin: '0 0 1.5rem', fontSize: '14px', color: '#555577', lineHeight: 1.6 }}>
                Are you sure you want to delete this post? This action cannot be undone.
              </p>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-red)',
                      background: 'var(--color-red-10)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={closeModal}
                  disabled={isDeleting}
                  style={{
                    padding: '10px 20px', borderRadius: '8px',
                    border: '1px solid #e0e0f0', background: '#fff',
                    color: '#555577', fontSize: '14px', cursor: 'pointer'
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className='btn danger'
                  style={{ padding: '10px 20px', fontSize: '14px' }}
                >
                  <AnimatePresence mode="wait">
                    {isDeleting ? (
                      <motion.span
                        key="deleting"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        style={{ display: 'block' }}
                      >
                        Deleting...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="delete"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        style={{ display: 'block' }}
                      >
                        Delete
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default DeletePost