import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface SEOProps {
  title?: string
  description?: string
  canonicalPath?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'music.song'
}

const DEFAULT_TITLE = 'Patizan Records | Recording Studio in Tamarac, FL'
const DEFAULT_DESCRIPTION =
  'Patizan Records is a premier recording studio in Tamarac, FL. Professional vocal recording, podcast production, mixing, mastering, beat production, and creative facilities in South Florida.'
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=85&auto=format&fit=crop'
const BASE_DOMAIN = (import.meta.env.VITE_APP_URL || 'https://patizanrecords.com').replace(/\/+$/, '')

/**
 * PATIZAN RECORDS — SEO & Open Graph Metadata Manager
 * Dynamically updates document head tags, canonical link, and social previews on route transition.
 */
export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
}: SEOProps) {
  const location = useLocation()
  const cleanPath = canonicalPath !== undefined ? canonicalPath : location.pathname
  const canonicalUrl = `${BASE_DOMAIN}${cleanPath === '/' ? '' : cleanPath}`

  useEffect(() => {
    // 1. Title
    document.title = title

    // 2. Helper to set or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    // 3. Primary Meta Tags
    setMeta('title', title)
    setMeta('description', description)

    // 4. Open Graph
    setMeta('og:type', ogType, true)
    setMeta('og:url', canonicalUrl, true)
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('og:image', ogImage, true)
    setMeta('og:site_name', 'Patizan Records', true)

    // 5. Twitter Card
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:url', canonicalUrl)
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    setMeta('twitter:image', ogImage)

    // 6. Canonical Link Tag
    let canonicalEl = document.querySelector('link[rel="canonical"]')
    if (!canonicalEl) {
      canonicalEl = document.createElement('link')
      canonicalEl.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalEl)
    }
    canonicalEl.setAttribute('href', canonicalUrl)
  }, [title, description, canonicalUrl, ogImage, ogType])

  return null
}
