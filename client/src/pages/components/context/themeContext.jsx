import { createContext, useContext, useEffect, useState } from 'react'
import { getAccentBg, ACCENT_NAMES } from '../accentConfig'

export const ThemeContext = createContext()

// Read accent list from CSS --accents variable at runtime
const getAccents = () => {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--accents')
    .trim()
  return raw
    ? raw.split(',').map(a => a.trim()).filter(Boolean)
    : ACCENT_NAMES
}

const ThemeProvider = ({ children }) => {
  const [colorMode, setColorMode] = useState(() =>
    localStorage.getItem('colorMode') || 'light'
  )
  const [density, setDensity] = useState(() =>
    localStorage.getItem('density') || 'comfortable'
  )
  const [accent, setAccent] = useState(() =>
    localStorage.getItem('accent') || 'purple'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', colorMode)
    localStorage.setItem('colorMode', colorMode)
  }, [colorMode])

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density)
    localStorage.setItem('density', density)
  }, [density])

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent)
    localStorage.setItem('accent', accent)
  }, [accent])

  // ── Dynamic bg — runs whenever EITHER accent or colorMode changes ────────
  // Must be separate from the accent/colorMode effects above so it always
  // has the latest value of both. style.setProperty on :root overrides the
  // CSS variable directly, so we need to re-apply it on every relevant change.
  useEffect(() => {
    const isDark = colorMode === 'dark'
    document.documentElement.style.setProperty(
      '--color-bg',
      getAccentBg(accent, isDark)
    )
  }, [accent, colorMode])

  const toggleColorMode = () =>
    setColorMode(prev => prev === 'light' ? 'dark' : 'light')

  const cycleDensity = () =>
    setDensity(prev => {
      if (prev === 'comfortable') return 'compact'
      if (prev === 'compact') return 'spacious'
      return 'comfortable'
    })

  const cycleAccent = () => {
    const list = getAccents()
    setAccent(prev => {
      const i = list.indexOf(prev)
      return list[(i + 1) % list.length]
    })
  }

  const accents = getAccents()

  return (
    <ThemeContext.Provider value={{
      colorMode, toggleColorMode,
      density, cycleDensity,
      accent, cycleAccent,
      accents,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
export default ThemeProvider