import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ShieldAlert, KeyRound, X } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { adminLoginSchema, type AdminLoginData } from '../../lib/validations'
import { getErrorMessage } from '../../lib/supabaseErrors'
import SEO from '../../components/common/SEO'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { isAdmin, isLoading, setUser, setIsAdmin } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange/30 border-t-orange rounded-full animate-spin" />
      </div>
    )
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  const onSubmit = async (data: AdminLoginData) => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase connection is not configured. Please verify your environment variables.')
      return
    }

    try {
      // Standard Supabase Auth sign in
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      })

      if (signInError) throw signInError

      if (authData.user) {
        // Strict Authorization: Verify user is an active administrator in admin_users table
        const { data: adminRecord, error: adminCheckError } = await supabase
          .from('admin_users')
          .select('id, role, is_active')
          .eq('profile_id', authData.user.id)
          .eq('is_active', true)
          .single()

        if (adminCheckError || !adminRecord) {
          // Sign out unauthorized user immediately
          await supabase.auth.signOut()
          setUser(null)
          setIsAdmin(false)
          toast.error('Access restricted. Your account is not authorized as a Patizan Records administrator.')
          return
        }

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        setUser(
          profile || {
            id: authData.user.id,
            email: authData.user.email || data.email,
            full_name: authData.user.user_metadata?.full_name || 'Studio Administrator',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        )
        setIsAdmin(true)
        toast.success('Welcome to Patizan Records Admin')
        navigate('/admin')
      }
    } catch (err: unknown) {
      const formattedMessage = getErrorMessage(err, 'Authentication failed. Please verify your credentials.')
      toast.error(formattedMessage)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail || !resetEmail.includes('@')) {
      toast.error('Please enter a valid administrator email address.')
      return
    }

    setIsResetting(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/admin/login`,
      })
      if (error) throw error
      toast.success('Password recovery instructions sent to your email.')
      setShowForgotPassword(false)
      setResetEmail('')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to send password reset email.'))
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-orange selection:text-black relative">
      <SEO
        title="Admin Portal | Patizan Records"
        description="Restricted management portal for Patizan Records studio operations."
        canonicalPath="/admin/login"
      />

      {/* Background Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[32rem] h-[32rem] bg-orange/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[24rem] h-[24rem] bg-gold/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <span className="font-heading font-bold text-3xl tracking-widest text-offwhite uppercase block">
              PATIZAN
            </span>
            <span className="font-heading font-light text-xs tracking-[0.35em] text-orange uppercase block mt-0.5">
              RECORDS
            </span>
          </div>
          <p className="text-gray-muted text-xs uppercase tracking-wider mt-3 font-heading font-medium">
            Studio Management Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-gray-border rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="font-heading font-bold text-xl text-offwhite">Portal Sign In</h1>
            <p className="text-gray-muted text-xs mt-1 font-body">
              Enter your verified credentials to access studio operations.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="admin-email" className="label-field">
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted pointer-events-none flex items-center justify-center">
                  <Mail size={16} />
                </span>
                <input
                  id="admin-email"
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="name@domain.com"
                  className="input-field input-field-icon-left rounded-xl"
                  style={{ paddingLeft: '3rem', paddingRight: '1rem' }}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 font-body flex items-center gap-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="admin-password" className="label-field !mb-0">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[11px] text-gray-muted hover:text-orange transition-colors font-body cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted pointer-events-none flex items-center justify-center">
                  <Lock size={16} />
                </span>
                <input
                  id="admin-password"
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="input-field input-field-icon-left input-field-icon-right rounded-xl"
                  style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-muted hover:text-offwhite transition-colors rounded-lg focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 font-body flex items-center gap-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="admin-submit-btn"
              disabled={isSubmitting}
              className="btn-primary w-full rounded-xl text-xs py-3.5 mt-2 font-heading font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-orange/20"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <span>SIGN IN</span>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-gray-muted text-xs mt-6 font-body">
          <ShieldAlert size={14} className="text-orange shrink-0" />
          <span>Restricted Portal · Patizan Records Authorized Personnel Only</span>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForgotPassword(false)}
          >
            <motion.div
              className="bg-[#111111] border border-gray-border rounded-2xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowForgotPassword(false)}
                className="absolute top-4 right-4 text-gray-muted hover:text-offwhite transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange/10 border border-orange/30 flex items-center justify-center text-orange">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-offwhite">Reset Password</h3>
                  <p className="text-gray-muted text-xs">Enter your admin email address</p>
                </div>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="label-field">Administrator Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="input-field rounded-xl text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="btn-secondary flex-1 rounded-xl text-xs py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="btn-primary flex-1 rounded-xl text-xs py-2.5 font-heading font-bold tracking-wider flex items-center justify-center gap-2"
                  >
                    {isResetting ? (
                      <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      'SEND LINK'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
