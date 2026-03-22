import { createContext, useContext, useState } from 'react'

const TransitionContext = createContext()
export const useTransition = () => useContext(TransitionContext)

export const TransitionProvider = ({ children }) => {
  const [originRect, setOriginRect]     = useState(null)
  const [preloadedPost, setPreloadedPost] = useState(null)

  const setOrigin    = (rect) => setOriginRect(rect)
  const clearOrigin  = () => setOriginRect(null)

  const storePreload = (post) => setPreloadedPost(post)
  const clearPreload = () => setPreloadedPost(null)

  return (
    <TransitionContext.Provider
      value={{
        originRect,
        setOrigin,
        clearOrigin,
        preloadedPost,
        storePreload,
        clearPreload,
      }}
    >
      {children}
    </TransitionContext.Provider>
  )
}

export default TransitionProvider