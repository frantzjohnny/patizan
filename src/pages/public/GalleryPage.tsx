import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, Play } from 'lucide-react'
import { useGalleryCategories, useGalleryItems } from '../../hooks/useGallery'
import { getYouTubeId, getYouTubeThumbnail } from '../../lib/utils'
import type { GalleryItem } from '../../types'
import SEO from '../../components/common/SEO'

function LightboxModal({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <button
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-charcoal border border-gray-border flex items-center justify-center text-offwhite hover:text-orange transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <motion.div
          className="max-w-5xl max-h-[90vh] w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {item.media_type === 'image' && (
            <img
              src={item.url}
              alt={item.title || ''}
              className="w-full max-h-[85vh] object-contain rounded-xl"
            />
          )}
          {(item.media_type === 'youtube') && (
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(item.url)}?autoplay=1`}
                className="w-full h-full"
                allowFullScreen
                title={item.title || 'Video'}
              />
            </div>
          )}
          {item.media_type === 'video' && (
            <video
              src={item.url}
              controls
              autoPlay
              className="w-full max-h-[85vh] rounded-xl"
            />
          )}
          {item.title && (
            <p className="text-offwhite/70 text-sm mt-4 text-center font-body">{item.title}</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function GalleryCard({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  const isVideo = ['video', 'youtube', 'vimeo'].includes(item.media_type)
  const thumbnail = item.thumbnail_url || (item.media_type === 'youtube' ? getYouTubeThumbnail(item.url) : item.url)

  return (
    <motion.div
      className="relative group cursor-pointer overflow-hidden rounded-2xl bg-charcoal"
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      layout
    >
      <div className="aspect-square">
        {thumbnail && (
          <img
            src={thumbnail}
            alt={item.title || ''}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />

        {/* Icons */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isVideo ? (
            <div className="w-14 h-14 rounded-full bg-orange/90 flex items-center justify-center">
              <Play size={24} className="text-black ml-1" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-black/60 border border-white/20 flex items-center justify-center">
              <ZoomIn size={22} className="text-white" />
            </div>
          )}
        </div>

        {/* Category badge */}
        {item.is_featured && (
          <div className="absolute top-3 left-3 bg-orange text-black text-[10px] font-heading font-bold px-2 py-1 rounded-md tracking-wider">
            FEATURED
          </div>
        )}

        {/* Title */}
        {item.title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-sm font-heading font-medium truncate">{item.title}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function GalleryPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  const { data: categories = [] } = useGalleryCategories()
  const { data: galleryData, isLoading } = useGalleryItems(selectedCategoryId)
  const items = galleryData?.data || []

  return (
    <>
      <SEO
        title="Studio Gallery | Patizan Records"
        description="Explore visual media, artist session photography, behind-the-scenes videos, and studio tours from Patizan Records in South Florida."
        canonicalPath="/gallery"
      />
      {/* Hero */}
      <section className="pt-32 pb-16 bg-black">
        <div className="container-wide">
          <motion.p
            className="section-label mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            INSIDE PATIZAN
          </motion.p>
          <motion.h1
            className="font-heading font-bold text-display-xl text-offwhite"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
          >
            GALLERY.
          </motion.h1>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-black border-b border-gray-border/30 sticky top-20 z-30">
        <div className="container-wide overflow-x-auto no-scrollbar">
          <div className="flex gap-1 py-3 min-w-max">
            <button
              onClick={() => setSelectedCategoryId(undefined)}
              className={`px-5 py-2 rounded-lg text-xs font-heading font-semibold tracking-wider uppercase transition-all ${
                !selectedCategoryId ? 'bg-orange text-black' : 'text-gray-muted hover:text-offwhite'
              }`}
            >
              ALL
            </button>
            {categories.filter(c => c.slug !== 'all').map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-5 py-2 rounded-lg text-xs font-heading font-semibold tracking-wider uppercase transition-all ${
                  selectedCategoryId === cat.id ? 'bg-orange text-black' : 'text-gray-muted hover:text-offwhite'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <section className="section bg-black">
        <div className="container-wide">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-charcoal rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 text-gray-muted">
              <p className="font-body text-lg">No items in this category yet.</p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <GalleryCard item={item} onClick={() => setSelectedItem(item)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedItem && (
        <LightboxModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  )
}
