'use client'

import { signUp } from '@/app/actions/authActions'
import AuthCard from '@/components/auth/AuthCard'
import Btn from '@/components/ui/Btn'
import TextInput from '@/components/ui/TextInput'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

export default function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.')
        return
      }

      setLoading(true)
      const result = await signUp(email, password)
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      router.replace('/verify-email')
    },
    [email, password, confirmPassword, router]
  )

  return (
    <AuthCard title="Create account" onSubmit={handleSubmit}>
      <div className="mb-6 flex flex-col gap-4">
        <TextInput label="Email" value={email} type="email" autocomplete="email" onChange={setEmail} />
        <TextInput label="Password" value={password} type="password" autocomplete="new-password" onChange={setPassword} />
        <TextInput label="Confirm password" value={confirmPassword} type="password" autocomplete="new-password" onChange={setConfirmPassword} />
      </div>

      {error && <div className="mb-4 text-center text-sm text-red-400">{error}</div>}

      <div className="flex flex-col gap-4">
        <Btn type="submit" loading={loading} className="w-full">
          Create account
        </Btn>

        <p className="text-foreground-muted text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
