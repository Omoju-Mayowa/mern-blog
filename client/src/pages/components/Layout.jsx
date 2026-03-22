import React, { useEffect, useRef } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Lenis from "lenis"
import { AnimatePresence, motion } from "motion/react"
import NavBar from "./NavBar"
import Footer from "./Footer"
import CursorManager from "./CursorManager"

const isPostDetail = (pathname) =>
  /^\/posts\/[^/]+$/.test(pathname) &&
  !pathname.includes('/edit') &&
  !pathname.includes('/delete')

const Layout = () => {
  const location = useLocation()
  const footerRef = useRef(null)
  const lenisRef = useRef(null)
  const onPostDetail = isPostDetail(location.pathname)

  useEffect(() => {
    const lenis = new Lenis({ 
      duration: 2, 
      smoothWheel: true, 
      smoothTouch: false,
    })
    lenisRef.current = lenis
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [location.pathname])

  return (
    <div className="app">
      <CursorManager />
      {!onPostDetail && <NavBar />}

      <AnimatePresence mode="wait" initial={false}>
        {onPostDetail ? (
          <main
            key={location.pathname}
            className="main-content main-content--detail"
          >
            <Outlet />
          </main>
        ) : (
          <motion.main
            key={location.pathname}
            className="main-content"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Outlet />
          </motion.main>
        )}
      </AnimatePresence>

      {!onPostDetail && (
        <div ref={footerRef} className="animated-footer">
          <Footer />
        </div>
      )}
    </div>
  )
}

export default Layout