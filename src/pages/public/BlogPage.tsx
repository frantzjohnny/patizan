import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import type { BlogPost } from '../../types'
import SEO from '../../components/common/SEO'

function BlogCard({ post, large = false }: { post: BlogPost; large?: boolean }) {
  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      <div className={`relative overflow-hidden rounded-2xl ${large ? 'aspect-[16/9]' : 'aspect-[4/3]'} bg-charcoal mb-4`}>
        {post.cover_url && (
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-muted mb-2">
        <Calendar size={12} />
        <span>{post.published_at ? formatDate(post.published_at) : 'Draft'}</span>
        {post.category && (
          <>
            <span>·</span>
            <span className="text-orange">{post.category.name}</span>
          </>
        )}
      </div>
      <h3 className={`font-heading font-bold text-offwhite group-hover:text-orange transition-colors ${large ? 'text-2xl' : 'text-lg'} mb-2`}>
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="text-offwhite/50 text-sm font-body line-clamp-2">{post.excerpt}</p>
      )}
      <div className="flex items-center gap-1 text-orange text-xs font-heading font-semibold tracking-wider uppercase mt-3 group-hover:gap-2 transition-all">
        Read More <ArrowRight size={12} />
      </div>
    </Link>
  )
}

export default function BlogPage() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, category:blog_categories(*)')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })

  const featured = posts.find((p) => p.is_featured)
  const rest = posts.filter((p) => !p.is_featured)

  return (
    <>
      <SEO
        title="Patizan Records | Music & Studio Blog"
        description="Read recording studio news, vocal production tips, mixing guides, and music industry insights from Patizan Records in South Florida."
        canonicalPath="/blog"
      />
      <section className="pt-32 pb-16 bg-black">
        <div className="container-wide">
          <motion.p className="section-label mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            LATEST
          </motion.p>
          <motion.h1
            className="font-heading font-bold text-display-xl text-offwhite"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
          >
            THE BLOG.
          </motion.h1>
        </div>
      </section>

      <section className="section bg-black pt-0">
        <div className="container-wide">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-charcoal rounded-2xl animate-pulse" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24 text-gray-muted">
              <p className="font-body text-lg">No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <div>
              {/* Featured */}
              {featured && (
                <div className="mb-12">
                  <BlogCard post={featured} large />
                </div>
              )}
              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rest.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <BlogCard post={post} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
