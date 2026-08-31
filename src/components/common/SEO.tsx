import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSiteSettings } from '../../hooks/useSettings'

interface SEOProps {
  title?: string
  description?: string
  canonicalPath?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'music.song'
}

const DEFAULT_TITLE = 'Patizan Records | Recording Studio in Tamarac, FL'
const DEFAULT_DESCRIPTION =
  'Professional recording, music production, mixing, mastering, podcast and creative studio services in Tamarac, Florida.'
const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=1200&h=630&fit=crop&q=85'
const BASE_DOMAIN = (import.meta.env.VITE_APP_URL || 'https://patizanrecords.com').replace(/\/+$/, '')

/**
 * PATIZAN RECORDS — SEO & Open Graph Metadata Manager
 * Dynamically updates document head tags, canonical link, and social previews on route transition.
 * Uses CMS-configured settings from Supabase site_settings as the baseline source of truth.
 */
export default function SEO({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = 'website',
}: SEOProps) {
  const location = useLocation()
  const { data: settings } = useSiteSettings()

  const activeTitle = title || settings?.seo_title || settings?.studio_name || DEFAULT_TITLE
  const activeDescription = description || settings?.meta_description || DEFAULT_DESCRIPTION
  const activeOgImage = ogImage || settings?.og_image_url || DEFAULT_OG_IMAGE
  const activeBaseDomain = settings?.canonical_url ? settings.canonical_url.replace(/\/+$/, '') : BASE_DOMAIN

  const cleanPath = canonicalPath !== undefined ? canonicalPath : location.pathname
  const canonicalUrl = `${activeBaseDomain}${cleanPath === '/' ? '' : cleanPath}`

  useEffect(() => {
    // 1. Title
    document.title = activeTitle

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
    setMeta('title', activeTitle)
    setMeta('description', activeDescription)

    // 4. Open Graph
    setMeta('og:type', ogType, true)
    setMeta('og:url', canonicalUrl, true)
    setMeta('og:title', activeTitle, true)
    setMeta('og:description', activeDescription, true)
    setMeta('og:image', activeOgImage, true)
    setMeta('og:image:secure_url', activeOgImage, true)
    setMeta('og:image:width', '1200', true)
    setMeta('og:image:height', '630', true)
    setMeta('og:image:alt', `${activeTitle} - Social Preview`, true)
    setMeta('og:site_name', settings?.studio_name || 'Patizan Records', true)

    // 5. Twitter Card
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:url', canonicalUrl)
    setMeta('twitter:title', activeTitle)
    setMeta('twitter:description', activeDescription)
    setMeta('twitter:image', activeOgImage)

    // 6. Canonical Link Tag
    let canonicalEl = document.querySelector('link[rel="canonical"]')
    if (!canonicalEl) {
      canonicalEl = document.createElement('link')
      canonicalEl.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalEl)
    }
    canonicalEl.setAttribute('href', canonicalUrl)
  }, [activeTitle, activeDescription, canonicalUrl, activeOgImage, ogType, settings?.studio_name])

  return null
}
