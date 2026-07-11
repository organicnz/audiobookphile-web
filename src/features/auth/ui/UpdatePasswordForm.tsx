'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/client'

export function UpdatePasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
    } else {
      setMessage('Password updated successfully! Redirecting to home...')
      setTimeout(() => {
        router.push('/home')
      }, 2000)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 liquid-glass p-8 relative overflow-hidden animate-fade-in-up">
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-primary/20 rounded-full blur-[80px] mix-blend-screen pointer-events-none transition-colors duration-1000"></div>
      
      <div className="relative">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-off-white">
          Set New Password
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Please enter your new password below.
        </p>
      </div>

      {message ? (
        <div className="relative text-primary text-sm text-center p-4 bg-primary/10 border border-primary/20 rounded-lg animate-fade-in-up">
          {message}
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="relative mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">New Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-white/10 bg-white/5 text-off-white placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all"
                placeholder="New Password"
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm text-center p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in-up">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(0,240,181,0.39)] hover:shadow-[0_6px_20px_rgba(0,240,181,0.5)] hover:-translate-y-0.5 active:scale-95"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  )
}
