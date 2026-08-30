import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * PATIZAN RECORDS — Global ScrollToTop Manager
 *
 * Ensures every route navigation opens at scrollY = 0 (top of page).
 * If a valid hash anchor is present (e.g., #recording, #services),
 * it smoothly scrolls to that anchor without getting stuck at bottom.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    // If an anchor hash exists (e.g., #recording)
    if (hash) {
      const elementId = hash.replace('#', '')
      // Wait for DOM to be ready
      const timer = setTimeout(() => {
        const element = document.getElementById(elementId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        }
      }, 50)
      return () => clearTimeout(timer)
    }

    // Default route navigation: scroll straight to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, search, hash])

  return null
}
