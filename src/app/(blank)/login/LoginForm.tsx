'use client'

import { signInWithGoogle } from '@/features/auth/actions/authActions'
import AuthCard from '@/features/auth/components/AuthCard'
import Btn from '@/shared/ui/Btn'
import TextInput from '@/shared/ui/TextInput'
import { createClient } from '@/shared/utils/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch {
      setGoogleLoading(false)
    }
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

        <Btn
          type="button"
          color="bg-bg-light"
          className="border-border flex w-full items-center justify-center gap-2 border"
          loading={googleLoading}
          onClick={handleGoogleSignIn}
        >
          <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
          </svg>
          Google
        </Btn>

        <p className="text-foreground-muted text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
