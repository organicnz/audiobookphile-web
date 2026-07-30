'use client'

import { useState, useActionState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Mail, UserPlus, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { inviteUserByEmail } from '@/features/auth/actions/authActions'

type InviteState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15, delay: 0.3 }
  }
}

const feedbackVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
  exit: { opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.15 } }
}

export function AdminInvitePanel() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [userType, setUserType] = useState('user')
  const [feedback, setFeedback] = useState<InviteState>({ status: 'idle', message: '' })

  const [_, submitAction, isPending] = useActionState(
    async (_prevState: InviteState, _formData: FormData) => {
      setFeedback({ status: 'idle', message: '' })

      if (!email || !email.includes('@')) {
        const state: InviteState = { status: 'error', message: 'Please enter a valid email address.' }
        setFeedback(state)
        return state
      }

      const result = await inviteUserByEmail(email, username || undefined, userType)

      if (result.error) {
        const state: InviteState = { status: 'error', message: result.error }
        setFeedback(state)
        return state
      }

      const state: InviteState = { status: 'success', message: `Invitation sent to ${email}` }
      setFeedback(state)
      setEmail('')
      setUsername('')
      setUserType('user')

      // Auto-clear success after 5s
      setTimeout(() => setFeedback({ status: 'idle', message: '' }), 5000)
      return state
    },
    { status: 'idle', message: '' } as InviteState
  )

  return (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-indigo-500/20 p-2.5">
          <UserPlus className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Invite User</h2>
          <p className="text-sm text-white/50">Send an email invitation to add a new member</p>
        </div>
      </div>

      {/* Form */}
      <form action={submitAction}>
        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="invite-email" className="text-foreground-muted block text-xs font-medium tracking-wide uppercase">
              Email Address
            </label>
            <div className="relative">
              <Mail className="text-foreground-subdued pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                disabled={isPending}
                className="border-border bg-background text-foreground placeholder-foreground-subdued focus:border-accent focus:bg-primary focus:ring-accent/30 w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:ring-1 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Username (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="invite-username" className="text-foreground-muted block text-xs font-medium tracking-wide uppercase">
              Username <span className="text-foreground-subdued">(optional)</span>
            </label>
            <input
              id="invite-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              disabled={isPending}
              className="border-border bg-background text-foreground placeholder-foreground-subdued focus:border-accent focus:bg-primary focus:ring-accent/30 w-full rounded-xl border px-4 py-2.5 text-sm transition-all outline-none focus:ring-1 disabled:opacity-50"
            />
          </div>

          {/* User Type */}
          <div className="space-y-1.5">
            <label htmlFor="invite-user-type" className="text-foreground-muted block text-xs font-medium tracking-wide uppercase">
              Role
            </label>
            <div className="relative">
              <Shield className="text-foreground-subdued pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <select
                id="invite-user-type"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                disabled={isPending}
                className="border-border bg-background text-foreground focus:border-accent focus:bg-primary focus:ring-accent/30 w-full appearance-none rounded-xl border py-2.5 pr-10 pl-10 text-sm transition-all outline-none focus:ring-1 disabled:opacity-50"
              >
                <option value="user" className="bg-primary text-foreground">
                  User
                </option>
                <option value="admin" className="bg-primary text-foreground">
                  Admin
                </option>
              </select>
              <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                <svg className="text-foreground-subdued h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <AnimatePresence mode="wait">
          {feedback.status !== 'idle' && (
            <motion.div
              key={feedback.status}
              variants={feedbackVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                feedback.status === 'success'
                  ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                  : 'border border-red-500/20 bg-red-500/10 text-red-400'
              }`}
            >
              {feedback.status === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || !email}
          className="bg-accent text-button-foreground shadow-accent/20 hover:bg-accent/90 hover:shadow-accent/30 mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending Invitation…
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Send Invitation
            </>
          )}
        </button>
      </form>

      {/* Decorative glow */}
      <div className="bg-accent absolute -right-8 -bottom-8 h-32 w-32 rounded-full opacity-[0.07] blur-2xl" />
      <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-amber-500 opacity-[0.05] blur-2xl" />
    </motion.div>
  )
}
