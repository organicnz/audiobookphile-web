'use client'

import { useActionState, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/client'
import { authAction } from '@/app/login/actions'
import { useFormStatus } from 'react-dom'

// Simple Google Icon SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

const GithubIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
)

type AuthMode = 'login' | 'signup' | 'magic_link' | 'forgot_password'

function SubmitButton({ mode }: { mode: AuthMode }) {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(0,240,181,0.39)] hover:shadow-[0_6px_20px_rgba(0,240,181,0.5)] hover:-translate-y-0.5 active:scale-95"
    >
      {pending ? 'Processing...' : (
        mode === 'login' ? 'Sign In' :
        mode === 'signup' ? 'Create Account' :
        mode === 'magic_link' ? 'Send Magic Link' :
        'Send Reset Link'
      )}
    </button>
  )
}

export function AuthForm() {
  const searchParams = useSearchParams()
  const defaultMessage = searchParams.get('message')

  const [state, formAction] = useActionState(authAction, null)
  const [mode, setMode] = useState<AuthMode>('login')
  const [userType, setUserType] = useState<'aficionado' | 'fan'>('fan')

  // Requirement 1: client-side checkbox validation state
  const [checkboxError, setCheckboxError] = useState<string | null>(null)

  // Requirement 2: track which mode produced the current action state to suppress stale messages
  const [submittedMode, setSubmittedMode] = useState<AuthMode | null>(null)

  // Requirement 2 + 3: clear stale action state and checkbox error on mode switch
  const switchMode = (next: AuthMode) => {
    setMode(next)
    setCheckboxError(null)
    setSubmittedMode(null)
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  // Requirement 1: intercept submit to validate checkboxes before dispatching server action
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (mode !== 'signup') return

    const form = e.currentTarget
    const termsChecked = (form.elements.namedItem('terms') as HTMLInputElement)?.checked
    const creatorChecked =
      userType !== 'aficionado' ||
      (form.elements.namedItem('creator-agreement') as HTMLInputElement)?.checked

    if (!termsChecked) {
      e.preventDefault()
      e.stopPropagation()
      setCheckboxError('You must accept the Terms of Service and Privacy Policy.')
      return
    }
    if (!creatorChecked) {
      e.preventDefault()
      e.stopPropagation()
      setCheckboxError('You must accept the Creator Monetization Agreement.')
      return
    }

    setCheckboxError(null)
    setSubmittedMode(mode)
    // allow normal form action dispatch to proceed
  }

  // Requirement 2: show action error/success only when it belongs to the current mode
  const displayError =
    checkboxError ??
    (submittedMode === mode ? (state?.error ?? null) : null) ??
    (defaultMessage && !state?.success ? defaultMessage : null)

  const displaySuccess = submittedMode === mode ? (state?.success ?? null) : null

  return (
    <div className="w-full max-w-md space-y-8 liquid-glass p-8 relative overflow-hidden">
      {/* Dynamic Background Glow Based on Mode */}
      <div className={`absolute -top-20 -left-20 w-48 h-48 rounded-full blur-[80px] mix-blend-screen pointer-events-none transition-colors duration-1000 ${
        mode === 'signup' ? 'bg-primary/20' : mode === 'magic_link' ? 'bg-blue-500/20' : 'bg-primary/10'
      }`}></div>

      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-off-white transition-all">
          {mode === 'login' && 'Welcome Back'}
          {mode === 'signup' && 'Join Aficionado'}
          {mode === 'magic_link' && 'Magic Link'}
          {mode === 'forgot_password' && 'Reset Password'}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {mode === 'login' && 'Sign in to access your wellness cockpit'}
          {mode === 'signup' && 'Create your account today'}
          {mode === 'magic_link' && 'Sign in securely without a password'}
          {mode === 'forgot_password' && 'We\'ll send you reset instructions'}
        </p>
      </div>

      <div className="flex justify-center space-x-2 border-b border-white/10 pb-4">
        <button onClick={() => switchMode('login')} className={`text-sm font-medium transition-colors ${mode === 'login' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>Login</button>
        <span className="text-muted-foreground/30">•</span>
        <button onClick={() => switchMode('signup')} className={`text-sm font-medium transition-colors ${mode === 'signup' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>Sign Up</button>
      </div>

      {displaySuccess ? (
        <div className="text-primary text-sm text-center p-4 bg-primary/10 border border-primary/20 rounded-lg animate-fade-in-up">
          {displaySuccess}
        </div>
      ) : (
        <form action={formAction} onSubmit={handleSubmit} className="mt-8 space-y-6">
          <input type="hidden" name="mode" value={mode} />
          {mode === 'signup' && <input type="hidden" name="userType" value={userType} />}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-white/10 bg-white/5 text-off-white placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-all"
                placeholder="Email address"
              />
            </div>
            
            {mode === 'signup' && (
              <div className="animate-fade-in-up flex space-x-4">
                <button
                  type="button"
                  onClick={() => setUserType('fan')}
                  className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                    userType === 'fan'
                      ? 'bg-primary/20 border-primary text-off-white'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  I'm a Fan
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('aficionado')}
                  className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                    userType === 'aficionado'
                      ? 'bg-primary/20 border-primary text-off-white'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  I'm an Aficionado
                </button>
              </div>
            )}
            
            {(mode === 'login' || mode === 'signup') && (
              <div className="animate-fade-in-up">
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-white/10 bg-white/5 text-off-white placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-all"
                  placeholder="Password"
                />
              </div>
            )}

            {mode === 'signup' && (
              <div className="animate-fade-in-up">
                <label htmlFor="zipCode" className="sr-only">Zip Code (Required for Neighborhoods)</label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  pattern="[0-9]{5}(-[0-9]{4})?"
                  title="5-digit ZIP code or ZIP+4 format (e.g. 90210 or 90210-1234)"
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-white/10 bg-white/5 text-off-white placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-all"
                  placeholder="Zip Code (Required for Local Communities)"
                />
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  {/* Requirement 1.5: removed native `required` — validation handled in JS */}
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="focus:ring-primary h-4 w-4 text-primary border-white/20 bg-white/5 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-white/80">
                    I agree to the <a href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</a>
                  </label>
                  <p className="text-muted-foreground text-xs mt-1">Includes strict prohibition of adult content.</p>
                </div>
              </div>

              {userType === 'aficionado' && (
                <div className="flex items-start animate-fade-in-up">
                  <div className="flex items-center h-5">
                    {/* Requirement 1.5: removed native `required` — validation handled in JS */}
                    <input
                      id="creator-agreement"
                      name="creator-agreement"
                      type="checkbox"
                      className="focus:ring-primary h-4 w-4 text-primary border-white/20 bg-white/5 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="creator-agreement" className="font-medium text-white/80">
                      I agree to the <a href="/creator-agreement" target="_blank" className="text-primary hover:underline">Creator Monetization Agreement</a>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {displayError && (
            <div className="text-destructive text-sm text-center p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in-up">
              {displayError}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            {mode === 'login' && (
              <>
                <button type="button" onClick={() => switchMode('forgot_password')} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Forgot your password?
                </button>
                <button type="button" onClick={() => switchMode('magic_link')} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Use Magic Link
                </button>
              </>
            )}
            {(mode === 'magic_link' || mode === 'forgot_password') && (
              <button type="button" onClick={() => switchMode('login')} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Back to Login
              </button>
            )}
          </div>

          <SubmitButton mode={mode} />
        </form>
      )}

      {/* OAuth Providers */}
      {(mode === 'login' || mode === 'signup') && (
        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background/80 text-muted-foreground backdrop-blur-sm rounded-full">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuth('google')}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-white/10 rounded-xl shadow-sm bg-white/5 text-sm font-medium text-off-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <GoogleIcon />
              Google
            </button>
            <button
              onClick={() => handleOAuth('github')}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-white/10 rounded-xl shadow-sm bg-white/5 text-sm font-medium text-off-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <GithubIcon />
              GitHub
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
