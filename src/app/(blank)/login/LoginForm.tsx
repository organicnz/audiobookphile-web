'use client'

import { signInWithGoogle, signInWithMagicLink } from '@/features/auth/actions/authActions'
import AuthCard from '@/features/auth/components/AuthCard'
import Btn from '@/shared/ui/Btn'
import TextInput from '@/shared/ui/TextInput'
import { createClient } from '@/shared/utils/supabase/client'
import { Fingerprint, Lock, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [magicSuccess, setMagicSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)

  const [requires2FA, setRequires2FA] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const [userId, setUserId] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [enrolledMethods, setEnrolledMethods] = useState<{ totp?: boolean; pin?: boolean; biometric?: boolean }>({})
  const [activeTab, setActiveTab] = useState<'totp' | 'pin' | 'biometric'>('totp')

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setLoading(true)
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password })
        })

        const data = await res.json()

        if (!res.ok || data.error) {
          setError(data.error?.message || data.error || 'Login failed. Please check your credentials.')
          setLoading(false)
          return
        }

        if (data.requires2FA) {
          setRequires2FA(true)
          setTempToken(data.tempToken || '')
          setUserId(data.userId || '')
          const methods = data.methods || { totp: true }
          setEnrolledMethods(methods)
          if (methods.biometric) setActiveTab('biometric')
          else if (methods.pin) setActiveTab('pin')
          else setActiveTab('totp')
          setLoading(false)
          return
        }

        // Establish session with Supabase using returned tokens to set SSR cookies
        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.user.token,
          refresh_token: data.user.refreshToken
        })

        if (sessionError) {
          setError(sessionError.message)
          setLoading(false)
          return
        }

        const redirectUrl = searchParams.get('redirect')
        if (redirectUrl) {
          window.location.href = redirectUrl
          return
        }

        if (data.userDefaultLibraryId) {
          window.location.href = `/library/${data.userDefaultLibraryId}`
          return
        }

        // Fetch libraries on the client side to avoid server-side route handler bugs
        try {
          const libsRes = await fetch('/api/libraries', {
            headers: { Authorization: `Bearer ${data.user.token}` }
          })
          if (libsRes.ok) {
            const libsData = await libsRes.json()
            if (libsData?.libraries?.length > 0) {
              window.location.href = `/library/${libsData.libraries[0].id}`
              return
            }
          }
        } catch (err) {
          console.error('[LoginForm] Failed to fetch libraries:', err)
        }

        window.location.href = '/library'
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('[LoginForm] Network error:', message)
        setError('Unable to connect to authentication service. Please check your internet connection.')
        setLoading(false)
      }
    },
    [email, password, searchParams]
  )

  const handle2FASubmit = useCallback(
    async (e?: React.FormEvent, methodOverride?: 'totp' | 'pin' | 'biometric') => {
      if (e) e.preventDefault()
      const chosenMethod = methodOverride || activeTab
      const codeToSend = chosenMethod === 'biometric' ? 'biometric' : chosenMethod === 'pin' ? pinCode : totpCode

      if (chosenMethod !== 'biometric' && !codeToSend) {
        setError('Please enter your verification code.')
        return
      }

      setError('')
      setLoading(true)
      try {
        const res = await fetch('/api/auth/2fa/verify-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, tempToken, code: codeToSend, method: chosenMethod })
        })

        const data = await res.json()

        if (!res.ok || data.error) {
          setError(data.error?.message || data.error || 'Invalid authentication code.')
          setLoading(false)
          return
        }

        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.user.token,
          refresh_token: data.user.refreshToken
        })

        if (sessionError) {
          setError(sessionError.message)
          setLoading(false)
          return
        }

        const redirectUrl = searchParams.get('redirect')
        if (redirectUrl) {
          window.location.href = redirectUrl
          return
        }

        if (data.userDefaultLibraryId) {
          window.location.href = `/library/${data.userDefaultLibraryId}`
          return
        }

        try {
          const libsRes = await fetch('/api/libraries', {
            headers: { Authorization: `Bearer ${data.user.token}` }
          })
          if (libsRes.ok) {
            const libsData = await libsRes.json()
            if (libsData?.libraries?.length > 0) {
              window.location.href = `/library/${libsData.libraries[0].id}`
              return
            }
          }
        } catch (err) {
          console.error('[LoginForm] Failed to fetch libraries:', err)
        }

        window.location.href = '/library'
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('[LoginForm] 2FA verify network error:', message)
        setError('Unable to verify two-factor code. Please check your connection.')
        setLoading(false)
      }
    },
    [userId, tempToken, totpCode, pinCode, activeTab, searchParams]
  )

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch {
      setGoogleLoading(false)
    }
  }

  const handleMagicLinkSignIn = async () => {
    if (!email) {
      setError('Please enter your email address above to receive a magic link.')
      return
    }
    setError('')
    setMagicSuccess('')
    setMagicLoading(true)
    try {
      const res = await signInWithMagicLink(email)
      if (res.error) {
        setError(res.error)
      } else {
        setMagicSuccess('Magic link sent! Check your email.')
      }
    } catch {
      setError('Failed to send magic link. Please try again.')
    } finally {
      setMagicLoading(false)
    }
  }

  const methodCount = (enrolledMethods.totp ? 1 : 0) + (enrolledMethods.pin ? 1 : 0) + (enrolledMethods.biometric ? 1 : 0)

  if (requires2FA) {
    return (
      <AuthCard title="Two-Factor Authentication" onSubmit={handle2FASubmit}>
        {methodCount > 1 && (
          <div className="border-border bg-bg-dark/50 mb-6 flex rounded-xl border p-1">
            {enrolledMethods.biometric && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('biometric')
                  setError('')
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                  activeTab === 'biometric' ? 'bg-accent text-white shadow-sm' : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                <Fingerprint className="h-3.5 w-3.5" />
                Biometric
              </button>
            )}
            {enrolledMethods.pin && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('pin')
                  setError('')
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                  activeTab === 'pin' ? 'bg-accent text-white shadow-sm' : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                PIN Code
              </button>
            )}
            {enrolledMethods.totp && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('totp')
                  setError('')
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                  activeTab === 'totp' ? 'bg-accent text-white shadow-sm' : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                TOTP
              </button>
            )}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4">
          {activeTab === 'biometric' && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="bg-accent/15 text-accent flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner">
                <Fingerprint className="h-9 w-9 animate-pulse" />
              </div>
              <p className="text-foreground-muted text-sm">Verify your identity using Face ID, Touch ID, or security key.</p>
              <Btn type="button" onClick={() => handle2FASubmit(undefined, 'biometric')} loading={loading} className="w-full py-3">
                Authenticate with Facial 2FA / Passkey
              </Btn>
            </div>
          )}

          {activeTab === 'pin' && (
            <div>
              <p className="text-foreground-muted mb-4 text-center text-sm">Enter your 4-8 digit security PIN code to sign in.</p>
              <TextInput label="PIN Code" value={pinCode} type="password" placeholder="••••••••" onChange={setPinCode} />
            </div>
          )}

          {activeTab === 'totp' && (
            <div>
              <p className="text-foreground-muted mb-4 text-center text-sm">
                Enter the 6-digit verification code from your authenticator app to finish signing in.
              </p>
              <TextInput
                label="6-Digit Verification Code"
                value={totpCode}
                type="text"
                autocomplete="one-time-code"
                placeholder="000000"
                onChange={setTotpCode}
              />
            </div>
          )}
        </div>

        {error && <div className="mb-4 text-center text-sm text-red-400">{error}</div>}

        <div className="flex flex-col gap-3">
          {activeTab !== 'biometric' && (
            <Btn type="submit" loading={loading} className="w-full">
              Verify & Sign in
            </Btn>
          )}
          <button
            type="button"
            onClick={() => {
              setRequires2FA(false)
              setTotpCode('')
              setPinCode('')
              setError('')
            }}
            className="text-foreground-muted hover:text-foreground text-center text-xs hover:underline"
          >
            Back to Login
          </button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Login" onSubmit={handleSubmit}>
      <div className="mb-4 flex flex-col gap-4">
        <TextInput label="Email" value={email} type="email" autocomplete="email" onChange={setEmail} />
        <TextInput label="Password" value={password} type="password" autocomplete="current-password" onChange={setPassword} />
      </div>

      <div className="mb-4 flex justify-end">
        <Link href="/forgot-password" className="text-accent text-sm hover:underline">
          Forgot password?
        </Link>
      </div>

      {error && <div className="mb-4 text-center text-sm text-red-400">{error}</div>}
      {magicSuccess && <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-center text-sm text-green-400">{magicSuccess}</div>}

      <div className="flex flex-col gap-4">
        <Btn type="submit" loading={loading} className="w-full">
          Sign in
        </Btn>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="border-border w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-bg text-foreground-muted px-2">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Btn
            type="button"
            color="bg-bg-light"
            className="border-border flex w-full items-center justify-center gap-2 border"
            loading={magicLoading}
            onClick={handleMagicLinkSignIn}
          >
            <svg className="text-accent h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
              />
            </svg>
            Magic Link
          </Btn>

          <Btn
            type="button"
            color="bg-bg-light"
            className="border-border flex w-full items-center justify-center gap-2 border"
            loading={googleLoading}
            onClick={handleGoogleSignIn}
          >
            <svg className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              />
            </svg>
            Google
          </Btn>
        </div>

        <p className="text-foreground-muted text-center text-xs">Registration is invitation-only. Please contact an administrator for access.</p>
      </div>
    </AuthCard>
  )
}
