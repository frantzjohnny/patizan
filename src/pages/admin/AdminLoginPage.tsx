import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { adminLoginSchema, type AdminLoginData } from '../../lib/validations'
import { getErrorMessage } from '../../lib/supabaseErrors'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { isAdmin, isLoading, setUser, setIsAdmin } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

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
      if (isRegistering) {
        // Register new admin account via Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: { full_name: 'Studio Administrator' },
          },
        })

        if (signUpError) throw signUpError

        if (signUpData.user) {
          // Check if confirmation email is required
          if (signUpData.session) {
            // Check if user is already an authorized admin
            const { data: adminUser } = await supabase
              .from('admin_users')
              .select('*')
              .eq('profile_id', signUpData.user.id)
              .eq('is_active', true)
              .single()

            if (adminUser) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', signUpData.user.id)
                .single()

              setUser(profile || {
                id: signUpData.user.id,
                email: signUpData.user.email || data.email,
                full_name: 'Studio Administrator',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              setIsAdmin(true)
              toast.success('Administrator account registered and authorized!')
              navigate('/admin')
              return
            }
          }

          toast.success(
            'Account created. To grant administrator dashboard access, authorize this user in admin_users.'
          )
          setIsRegistering(false)
          return
        }
      }

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

        // Fetch or create profile
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
        toast.success('Welcome back to Patizan Records Admin')
        navigate('/admin')
      }
    } catch (err: unknown) {
      const formattedMessage = getErrorMessage(err, 'Authentication failed. Please verify your credentials.')
      toast.error(formattedMessage)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-orange selection:text-black">
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
            <h1 className="font-heading font-bold text-xl text-offwhite">
              {isRegistering ? 'Create Admin Account' : 'Portal Sign In'}
            </h1>
            <p className="text-gray-muted text-xs mt-1 font-body">
              {isRegistering
                ? 'Register master credentials for studio administration.'
                : 'Enter your verified credentials to access studio operations.'}
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
                  placeholder="admin@patizanrecords.com"
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
              <label htmlFor="admin-password" className="label-field">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted pointer-events-none flex items-center justify-center">
                  <Lock size={16} />
                </span>
                <input
                  id="admin-password"
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
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
                  <span>{isRegistering ? 'CREATING ACCOUNT...' : 'AUTHENTICATING...'}</span>
                </>
              ) : (
                <span>{isRegistering ? 'CREATE ADMIN ACCOUNT' : 'ENTER PORTAL'}</span>
              )}
            </button>
          </form>

          {/* Toggle Registration / Sign In */}
          <div className="mt-6 pt-5 border-t border-gray-border/40 text-center">
            <button
              type="button"
              id="toggle-auth-mode-btn"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-gray-muted hover:text-orange transition-colors font-body cursor-pointer"
            >
              {isRegistering
                ? 'Existing administrator? Return to sign in'
                : 'Need to register the first admin account? Click here'}
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-gray-muted text-xs mt-6 font-body">
          <ShieldAlert size={14} className="text-orange shrink-0" />
          <span>Restricted Portal · Patizan Records Authorized Personnel Only</span>
        </div>
      </motion.div>
    </div>
  )
}
