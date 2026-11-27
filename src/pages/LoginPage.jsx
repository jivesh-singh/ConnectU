import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Sparkles, AlertCircle, Info, Lock } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { loginWithGoogle, loginAsDemoStudent } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      await loginWithGoogle()
    } catch (err) {
      console.warn('Google OAuth prompt error:', err)
      setErrorMessage(
        err.message ||
        'Supabase Google OAuth is not configured yet. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    loginAsDemoStudent()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#292724] flex items-center justify-center text-[#F5EBE0] shadow-xs group-hover:scale-105 transition-transform font-bold">
              <span className="text-lg">CU</span>
            </div>
            <span className="text-2xl font-bold text-[#292724]">ConnectU</span>
          </Link>
          <h2 className="text-2xl font-bold text-[#292724] tracking-tight">
            Welcome to Campus Network
          </h2>
          <p className="text-sm text-cu-text-muted">
            Connect with peers based on shared interests & complementary skills.
          </p>
        </div>

        {/* Login Card with Glassmorphism */}
        <Card variant="glass" className="p-8 shadow-glass-lg space-y-6 border border-[rgba(255,255,255,0.7)]">
          
          {/* Supabase Status Banner */}
          <div className="p-3.5 rounded-xl bg-[rgba(255,255,255,0.55)] border border-[rgba(255,255,255,0.7)] text-xs text-cu-text-muted flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cu-accent flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-cu-text-main">
                Institutional OAuth Integration
              </p>
              <p className="leading-relaxed">
                ConnectU uses Supabase Auth with Google OAuth for verified university identity.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Notice</p>
                <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Primary Google Login Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold text-sm py-3 px-4 rounded-xl border border-[rgba(227,213,202,0.85)] shadow-xs transition-all duration-200 hover:shadow-soft disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Instant Demo Access (Evaluation Gateway) */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-[rgba(227,213,202,0.7)] w-full" />
              <span className="bg-[rgba(245,235,224,0.9)] px-3 text-[11px] font-semibold uppercase tracking-wider text-cu-text-subtle">
                Or for evaluation
              </span>
            </div>

            <Button
              variant="secondary"
              fullWidth
              size="md"
              icon={Sparkles}
              onClick={handleDemoLogin}
            >
              Explore With Demo Student Profile
            </Button>
          </div>

          {/* Privacy & Student Explanation */}
          <div className="space-y-3 pt-2 border-t border-[rgba(227,213,202,0.6)] text-xs text-cu-text-muted">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cu-success flex-shrink-0 mt-0.5" />
              <p>
                Student verification ensures safety. We only access your basic Google profile name and college email.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-cu-text-subtle flex-shrink-0 mt-0.5" />
              <p>
                Your privacy is paramount. You control whether your profile is campus-wide or restricted to accepted contacts.
              </p>
            </div>
          </div>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-cu-text-muted">
          New to ConnectU?{' '}
          <Link to="/onboarding" className="font-bold text-[#292724] hover:underline">
            Complete Student Onboarding
          </Link>
        </p>

      </div>
    </div>
  )
}
