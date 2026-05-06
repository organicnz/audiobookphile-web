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
      <div className="flex justify-end">
        <Btn type="submit" loading={loading}>
          {t('LabelSubmit')}
        </Btn>
      </div>
    </form>
  )
}
