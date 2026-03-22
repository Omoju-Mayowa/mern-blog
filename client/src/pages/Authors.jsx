import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import API from './components/axios.js'
import Loader from './components/Loader'
import { motion, AnimatePresence } from 'motion/react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

const PER_PAGE = 20

const Authors = () => {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)

  const assetsBase = import.meta.env.VITE_API_ASSETS_URL || 'https://pub-ec6d8fbb35c24f83a77c02047b5c8f13.r2.dev'

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await API.get('/users')
        setAuthors(Array.isArray(response.data) ? response.data : [])
      } finally { setLoading(false) }
    }
    fetchAuthors()
  }, [])

  useEffect(() => { setPage(1) }, [search])

  const getAvatarUrl = (avatar) => {
    if (!avatar || avatar.includes('default')) return `${assetsBase}/mern/default-avatar.png`
    return avatar.startsWith('http') ? avatar : `${assetsBase}/mern/${avatar}`
  }

  const filtered = useMemo(() =>
    authors.filter(a => a.name?.toLowerCase().includes(search.toLowerCase())),
    [authors, search]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const goTo = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) return <section className="authors"><Loader size="small" /></section>

  return (
    <section className="authors">
      <h1 className="container h1__center">Our Authors</h1>

      {/* Search — same pattern as Search.jsx */}
      <div className="container">
        <div className="form login__form" style={{ marginBottom: '3rem' }}>
          <input
            type="text"
            placeholder="Search authors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Results count */}
      {search && (
        <div className="container" style={{ marginBottom: 'var(--space-4)', textAlign: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            {filtered.length === 0
              ? `No authors found for "${search}"`
              : `${filtered.length} author${filtered.length !== 1 ? 's' : ''} for "${search}"`
            }
          </span>
        </div>
      )}

      {/* Authors grid */}
      <div className="container authors__container">
        <AnimatePresence mode="wait">
          {paginated.length === 0 ? (
            <motion.p key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="center"
              style={{ gridColumn: '1/-1', padding: 'var(--space-12) 0', color: 'var(--color-text-muted)' }}
            >
              No authors match your search.
            </motion.p>
          ) : (
            paginated.map((author, i) => {
              const authorId = author._id || author.id
              if (!authorId) return null
              return (
                <motion.div key={authorId}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.03, duration: 0.22 }}
                >
                  <Link to={`/profile/${authorId}`} className="author">
                    <div className="author__avatar">
                      <img
                        src={getAvatarUrl(author.avatar)}
                        alt={author.name}
                        onError={e => { e.target.src = `${assetsBase}/mern/default-avatar.png` }}
                      />
                    </div>
                    <div className="author__info">
                      <h4>{author.name}</h4>
                      <p>{author.posts || 0} posts</p>
                    </div>
                  </Link>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.25 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 'var(--space-3)', marginTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}
        >
          <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
            onClick={() => goTo(safePage - 1)} disabled={safePage === 1}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '2.2rem', height: '2.2rem', borderRadius: '50%', border: 'none',
              background: safePage === 1 ? 'var(--color-surface)' : 'var(--color-primary)',
              color: safePage === 1 ? 'var(--color-text-muted)' : '#fff',
              cursor: safePage === 1 ? 'not-allowed' : 'pointer',
              opacity: safePage === 1 ? 0.5 : 1, fontSize: '1.1rem',
              transition: 'all 0.2s ease' }}
          ><HiChevronLeft /></motion.button>

          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)',
            fontWeight: 500, minWidth: '80px', textAlign: 'center' }}>
            Page {safePage} of {totalPages}
          </span>

          <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
            onClick={() => goTo(safePage + 1)} disabled={safePage === totalPages}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '2.2rem', height: '2.2rem', borderRadius: '50%', border: 'none',
              background: safePage === totalPages ? 'var(--color-surface)' : 'var(--color-primary)',
              color: safePage === totalPages ? 'var(--color-text-muted)' : '#fff',
              cursor: safePage === totalPages ? 'not-allowed' : 'pointer',
              opacity: safePage === totalPages ? 0.5 : 1, fontSize: '1.1rem',
              transition: 'all 0.2s ease' }}
          ><HiChevronRight /></motion.button>
        </motion.div>
      )}
    </section>
  )
}

export default Authors