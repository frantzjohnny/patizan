import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import { ArrowLeft } from 'lucide-react'
import type { BlogPost } from '../../types'
import SEO from '../../components/common/SEO'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async (): Promise<BlogPost | null> => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*, category:blog_categories(*)')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()
      return data
    },
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange/30 border-t-orange rounded-full animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black pt-32">
        <SEO
          title="Post Not Found | Patizan Records"
          description="The requested blog article could not be found."
          canonicalPath={`/blog/${slug}`}
        />
        <div className="container-standard text-center py-20">
          <h1 className="font-heading font-bold text-3xl text-offwhite mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-orange hover:underline">← Back to Blog</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title={`${post.title} | Patizan Records Blog`}
        description={post.excerpt || `Read ${post.title} on Patizan Records official blog.`}
        canonicalPath={`/blog/${post.slug}`}
        ogImage={post.cover_url || undefined}
        ogType="article"
      />

      <article className="min-h-screen bg-black">
        {/* Hero */}
        <div className="relative pt-24">
          {post.cover_url && (
            <div className="relative h-[50vh] overflow-hidden">
              <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black" />
            </div>
          )}
          <div className={`container-standard ${post.cover_url ? '-mt-32 relative z-10' : 'pt-16'}`}>
            <Link to="/blog" className="inline-flex items-center gap-2 text-gray-muted hover:text-orange text-sm mb-8 transition-colors">
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
            <div className="flex items-center gap-3 text-xs text-gray-muted mb-4">
              {post.published_at && <span>{formatDate(post.published_at, 'MMMM d, yyyy')}</span>}
              {post.category && (
                <>
                  <span>·</span>
                  <span className="text-orange">{post.category.name}</span>
                </>
              )}
              <span>·</span>
              <span>By {post.author}</span>
            </div>
            <motion.h1
              className="font-heading font-bold text-display-md text-offwhite mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {post.title}
            </motion.h1>
          </div>
        </div>

        {/* Content */}
        <div className="container-standard py-12 max-w-3xl">
          {post.excerpt && (
            <p className="text-offwhite/70 text-xl font-body leading-relaxed mb-8 italic border-l-2 border-orange pl-6">
              {post.excerpt}
            </p>
          )}
          {post.content && (
            <div
              className="prose prose-invert prose-orange max-w-none font-body text-offwhite/70 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          <div className="mt-16 pt-8 border-t border-gray-border">
            <Link to="/book-session" className="btn-primary rounded-xl text-sm inline-flex">
              BOOK A SESSION
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}
