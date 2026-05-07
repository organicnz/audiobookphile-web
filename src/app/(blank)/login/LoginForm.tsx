'use client'

import Btn from '@/components/ui/Btn'
import TextInput from '@/components/ui/TextInput'
import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

// Module-level singleton — avoid recreating on every render
const supabase = createClient()

export default function LoginForm() {
  const t = useTypeSafeTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setLoading(true)
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          setError(error.message || t('ErrorLoginFailed'))
          setLoading(false)
          return
        }

        const redirect = searchParams.get('redirect')
        router.replace(redirect || '/')
      } catch (err) {
        // Network-level failure — Supabase couldn't be reached at all
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('[LoginForm] Network error:', message)
        setError(`Unable to connect to authentication service. Please check your internet connection.`)
        setLoading(false)
      }
    },
    [email, password, t, router, searchParams]
  )

  return (
    <form onSubmit={handleSubmit} className="bg-bg border-border w-full max-w-md rounded-lg border p-10 shadow-lg">
      <h1 className="text-postcss mb-6 text-center text-2xl font-bold">{t('LabelLogin')}</h1>

      <div className="mb-4 flex flex-col gap-4">
        <TextInput label={t('LabelEmail')} value={email} autocomplete="email" onChange={setEmail} />
        <TextInput label={t('LabelPassword')} value={password} type="password" autocomplete="current-password" onChange={setPassword} />
      </div>
      {error && <div className="mb-4 text-center text-sm text-red-400">{error}</div>}
      <div className="flex flex-col gap-4">
        <Btn type="submit" loading={loading} className="w-full">
          {t('LabelSubmit')}
        </Btn>
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-bg text-foreground-muted px-2">Or continue with</span>
          </div>
        </div>

        <Btn 
          type="button" 
          color="bg-bg-light" 
          className="w-full flex items-center justify-center gap-2 border border-border"
          onClick={() => {
            const { signInWithGoogle } = require('@/app/actions/authActions')
            signInWithGoogle()
          }}
        >
          <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Google
        </Btn>
      </div>
    </form>
  )
}
