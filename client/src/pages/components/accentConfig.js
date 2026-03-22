/**
 * ACCENT CONFIG — single source of truth
 * To add a new accent:
 *   1. Add it here
 *   2. Add [data-accent='name'] block in index.css
 *   3. Add the name to --accents in :root in index.css
 *   That's it. Nothing else needs to change.
 */

export const ACCENTS = {
  purple: {
    primary: '#6f6af8',
    bgHue:    243,        // hwb hue for light mode tinted bg
    darkBg:  '#0e0d2e',  // dark mode bg — deep tint of accent
  },
  teal: {
    primary: '#1D9E75',
    bgHue:    161,
    darkBg:  '#091f1a',
  },
  rose: {
    primary: '#D4537E',
    bgHue:    337,
    darkBg:  '#1f0c14',
  },
  amber: {
    primary: '#F59E0B',
    bgHue:    38,
    darkBg:  '#1a1300',
  },
}

/**
 * Get the primary hex for a given accent name.
 * Falls back to purple if not found.
 */
export const getAccentColor = (name) =>
  ACCENTS[name]?.primary || ACCENTS.purple.primary

/**
 * Get the background color for a given accent + color mode.
 * Light: barely-perceptible tint at 91% whiteness
 * Dark:  deep dark tint of the accent
 */
export const getAccentBg = (name, isDark = false) => {
  if (isDark) return ACCENTS[name]?.darkBg || '#0c0c22'
  const hue = ACCENTS[name]?.bgHue ?? 243
  return `hwb(${hue} 91% 0%)`
}

/**
 * List of all accent names in order.
 * Used as fallback if CSS --accents variable isn't available.
 */
export const ACCENT_NAMES = Object.keys(ACCENTS)