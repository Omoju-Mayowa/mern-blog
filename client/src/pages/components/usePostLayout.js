import { useState, useCallback } from 'react'

export const DEFAULT_ORDER = ['thumbnail', 'title', 'description', 'author', 'actions']

const STORAGE_KEY = 'postLayoutOrder'

const loadOrder = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (
        Array.isArray(parsed) &&
        parsed.length === DEFAULT_ORDER.length &&
        DEFAULT_ORDER.every(s => parsed.includes(s))
      ) return parsed
    }
  } catch { }
  return [...DEFAULT_ORDER]
}

const saveOrder = (order) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(order)) } catch { }
}

export const usePostLayout = () => {
  const [sectionOrder, setSectionOrder] = useState(loadOrder)

  // Set an entirely new order and persist it
  const setOrder = useCallback((newOrder) => {
    setSectionOrder(newOrder)
    saveOrder(newOrder)
  }, [])

  // Reorder by index (used internally)
  const reorder = useCallback((fromIndex, toIndex) => {
    setSectionOrder(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      saveOrder(next)
      return next
    })
  }, [])

  const resetOrder = useCallback(() => {
    setSectionOrder([...DEFAULT_ORDER])
    saveOrder([...DEFAULT_ORDER])
  }, [])

  return { sectionOrder, setOrder, reorder, resetOrder }
}