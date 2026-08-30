import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Upload, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { uploadImage } from '../../lib/storage'
import { getErrorMessage } from '../../lib/supabaseErrors'
import { slugify, formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'
import type { BlogPost, BlogCategory } from '../../types'

export default function BlogAdminPage() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>()

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_url: '',
    author: 'Patizan Records',
    category_id: '',
    is_featured: false,
    is_published: true,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async (): Promise<BlogCategory[]> => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name')
      if (error) throw error
      return data || []
    },
  })

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, category:blog_categories(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadImage('blog', file, 'posts')
      setForm((f) => ({ ...f, cover_url: url }))
      toast.success('Cover image uploaded!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to upload cover image'))
    } finally {
      setUploading(false)
    }
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error('Blog title is required.')
      if (!form.slug.trim()) throw new Error('Blog slug is required.')

      const payload = {
        ...form,
        category_id: form.category_id || null,
        published_at: form.is_published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }
      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', editingPost.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('blog_posts').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] })
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      toast.success(editingPost ? 'Post updated!' : 'Post published!')
      setShowModal(false)
      setEditingPost(undefined)
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to save blog post'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] })
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      toast.success('Post deleted')
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to delete blog post'))
    },
  })

  const openCreate = () => {
    setEditingPost(undefined)
    setForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      cover_url: '',
      author: 'Patizan Records',
      category_id: '',
      is_featured: false,
      is_published: true,
    })
    setShowModal(true)
  }

  const openEdit = (p: BlogPost) => {
    setEditingPost(p)
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || '',
      content: p.content || '',
      cover_url: p.cover_url || '',
      author: p.author || 'Patizan Records',
      category_id: p.category_id || '',
      is_featured: p.is_featured,
      is_published: p.is_published,
    })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-offwhite">Articles & News</h1>
          <p className="text-gray-muted text-xs mt-1">Publish studio stories, audio production tips, artist spotlights, and gear news.</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary rounded-xl text-xs px-4 py-2.5 flex items-center gap-2"
        >
          <Plus size={15} />
          New Article
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-xs">
          {getErrorMessage(error, 'Failed to load blog posts from Supabase.')}
        </div>
      )}

      <div className="bg-charcoal border border-gray-border rounded-2xl overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Author</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6}>
                    <div className="h-8 bg-charcoal-light rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-muted text-xs">
                  No articles published yet. Click "New Article" to create one.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {post.cover_url ? (
                        <img
                          src={post.cover_url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-offwhite/40">
                          <FileText size={16} />
                        </div>
                      )}
                      <div>
                        <p className="font-heading font-semibold text-offwhite text-sm">{post.title}</p>
                        <p className="text-xs text-gray-muted line-clamp-1">{post.excerpt || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-xs text-offwhite/80">{post.category?.name || 'General'}</td>
                  <td className="text-xs text-gray-muted">{post.author}</td>
                  <td>
                    <span className={post.is_published ? 'badge-approved' : 'badge-cancelled'}>
                      {post.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="text-xs font-mono text-offwhite/70">{formatDate(post.created_at)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(post)}
                        className="p-1.5 text-gray-muted hover:text-offwhite transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete post "${post.title}"?`)) {
                            deleteMutation.mutate(post.id)
                          }
                        }}
                        className="p-1.5 text-gray-muted hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-charcoal border border-gray-border rounded-2xl p-6 md:p-8 w-full max-w-2xl my-8">
            <h3 className="font-heading font-bold text-xl text-offwhite mb-6">
              {editingPost ? 'Edit Article' : 'Write New Article'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label-field">Article Title *</label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })
                  }
                  placeholder="e.g. 5 Mixing Tips for Modern 808s"
                  className="input-field rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="input-field rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="label-field">Category</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="input-field rounded-xl"
                  >
                    <option value="">No Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label-field">Excerpt (Short Summary)</label>
                <input
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="One or two sentences summarizing the post..."
                  className="input-field rounded-xl"
                />
              </div>

              <div>
                <label className="label-field">Cover Image (URL or Upload)</label>
                <div className="flex gap-2">
                  <input
                    value={form.cover_url}
                    onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
                    placeholder="https://..."
                    className="input-field rounded-xl flex-1 text-xs"
                  />
                  <input
                    type="file"
                    ref={fileRef}
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-offwhite text-xs font-heading font-medium flex items-center gap-1.5 shrink-0"
                  >
                    <Upload size={14} />
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>
                {form.cover_url && (
                  <div className="mt-2 h-24 rounded-xl overflow-hidden border border-white/10 relative">
                    <img src={form.cover_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="label-field">Content (Markdown / Text)</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="input-field rounded-xl resize-none font-mono text-xs"
                  placeholder="Write article content here..."
                />
              </div>

              <div className="flex gap-6 pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="accent-orange"
                  />
                  <span className="text-offwhite/80 text-xs">Featured Article</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="accent-orange"
                  />
                  <span className="text-offwhite/80 text-xs">Published</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingPost(undefined)
                }}
                className="btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={!form.title.trim() || saveMutation.isPending || uploading}
                className="btn-primary rounded-xl text-xs px-6 py-2.5 disabled:opacity-40"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
