'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/client'

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length === 0) return { label: '', color: '', width: '0%' }
  if (pw.length < 8) return { label: 'Too short', color: 'bg-destructive', width: '25%' }
  const hasUpper = /[A-Z]/.test(pw)
  const hasLower = /[a-z]/.test(pw)
  const hasDigit = /\d/.test(pw)
  const hasSymbol = /[^A-Za-z0-9]/.test(pw)
  const score = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length
  if (score <= 2) return { label: 'Weak', color: 'bg-orange-400', width: '40%' }
  if (score === 3) return { label: 'Good', color: 'bg-yellow-400', width: '70%' }
  return { label: 'Strong', color: 'bg-primary', width: '100%' }
}

export function UpdatePasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const strength = getPasswordStrength(password)
  const mismatch = confirm.length > 0 && password !== confirm

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    setMessage('')
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    setMessage('Password updated successfully! Redirecting…')
    // Sign out other sessions after password change for security
    await supabase.auth.signOut({ scope: 'others' })
    router.replace('/home')
  }

  return (
    <div className="w-full max-w-md space-y-8 liquid-glass p-8 relative overflow-hidden animate-fade-in-up">
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-primary/20 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />

      <div className="relative">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-off-white">
          Set New Password
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>

      {message ? (
        <div className="relative text-primary text-sm text-center p-4 bg-primary/10 border border-primary/20 rounded-lg animate-fade-in-up">
          {message}
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="relative mt-8 space-y-6">
          <div className="space-y-4">
            {/* New password */}
            <div>
              <label htmlFor="password" className="sr-only">New Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-white/10 bg-white/5 text-off-white placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all"
                placeholder="New password (min. 8 characters)"
                minLength={8}
              />
              {/* Strength meter */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${strength.color.replace('bg-', 'text-')}`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`appearance-none rounded-xl relative block w-full px-3 py-3 border bg-white/5 text-off-white placeholder-muted-foreground focus:outline-none focus:ring-primary focus:z-10 sm:text-sm transition-all ${
                  mismatch ? 'border-destructive/60' : 'border-white/10'
                }`}
                placeholder="Confirm new password"
                minLength={8}
              />
              {mismatch && (
                <p className="text-xs mt-1 text-destructive">Passwords do not match</p>
              )}
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm text-center p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in-up">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || mismatch || password.length < 8}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(0,240,181,0.39)] hover:shadow-[0_6px_20px_rgba(0,240,181,0.5)] hover:-translate-y-0.5 active:scale-95"
          >
            {isLoading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  )
}
