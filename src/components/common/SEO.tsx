import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSiteSettings } from '../../hooks/useSettings'
import { getActiveStudioSeoImage, DEFAULT_STUDIO_SEO_IMAGE } from '../../data/studioImages'

interface SEOProps {
  title?: string
  description?: string
  canonicalPath?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'music.song'
}

const BASE_DOMAIN = (import.meta.env.VITE_APP_URL || 'https://patizanrecords.com').replace(/\/+$/, '')
const DEFAULT_TITLE = 'Patizan Records | Recording Studio in Tamarac, FL'
const DEFAULT_DESCRIPTION =
  'Professional recording, music production, mixing, mastering, podcast and creative studio services in Tamarac, Florida.'

/**
 * Helper to ensure OpenGraph / Twitter / Schema image URL is always a fully qualified absolute URL
 */
function resolveAbsoluteImageUrl(url: string, baseDomain: string): string {
  const chosenUrl = url || getActiveStudioSeoImage() || DEFAULT_STUDIO_SEO_IMAGE
  if (chosenUrl.startsWith('http://') || chosenUrl.startsWith('https://')) return chosenUrl
  const cleanPath = chosenUrl.startsWith('/') ? chosenUrl : `/${chosenUrl}`
  return `${baseDomain}${cleanPath}`
}

/**
 * PATIZAN RECORDS — Centralized SEO & Social Sharing Metadata Manager
 * Dynamically updates document head tags, canonical link, OpenGraph, Twitter cards,
 * and JSON-LD structured data on route transition.
 *
 * Single Source of Truth for Studio SEO Image: src/data/studioImages.ts
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
  const activeBaseDomain = settings?.canonical_url ? settings.canonical_url.replace(/\/+$/, '') : BASE_DOMAIN
  
  // Resolve primary SEO image from prop or centralized studio image config
  const rawOgImage = ogImage || settings?.og_image_url || getActiveStudioSeoImage()
  const activeOgImage = resolveAbsoluteImageUrl(rawOgImage, activeBaseDomain)

  const cleanPath = canonicalPath !== undefined ? canonicalPath : location.pathname
  const canonicalUrl = `${activeBaseDomain}${cleanPath === '/' ? '' : cleanPath}`

  useEffect(() => {
    // 1. Document Title
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

    // 7. Dynamic JSON-LD Structured Data
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'MusicVenue',
      name: settings?.studio_name || 'Patizan Records',
      description: activeDescription,
      image: activeOgImage,
      url: activeBaseDomain,
      telephone: '+19592056476',
      email: 'patizanrecordsmiami@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '3900 W Commercial Blvd, Suite 230',
        addressLocality: 'Tamarac',
        addressRegion: 'FL',
        postalCode: '33309',
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 26.1895,
        longitude: -80.1983,
      },
    }

    let jsonLdScript = document.getElementById('patizan-jsonld-schema')
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script')
      jsonLdScript.id = 'patizan-jsonld-schema'
      jsonLdScript.setAttribute('type', 'application/ld+json')
      document.head.appendChild(jsonLdScript)
    }
    jsonLdScript.textContent = JSON.stringify(structuredData, null, 2)
  }, [activeTitle, activeDescription, canonicalUrl, activeOgImage, ogType, settings?.studio_name, activeBaseDomain])

  return null
}
