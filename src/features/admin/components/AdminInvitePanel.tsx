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
            <label htmlFor="invite-email" className="block text-xs font-medium tracking-wide text-white/60 uppercase">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                disabled={isPending}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-sm text-white placeholder-white/30 transition-all outline-none focus:border-indigo-500/50 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Username (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="invite-username" className="block text-xs font-medium tracking-wide text-white/60 uppercase">
              Username <span className="text-white/30">(optional)</span>
            </label>
            <input
              id="invite-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              disabled={isPending}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 transition-all outline-none focus:border-indigo-500/50 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
            />
          </div>

          {/* User Type */}
          <div className="space-y-1.5">
            <label htmlFor="invite-user-type" className="block text-xs font-medium tracking-wide text-white/60 uppercase">
              Role
            </label>
            <div className="relative">
              <Shield className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
              <select
                id="invite-user-type"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                disabled={isPending}
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pr-10 pl-10 text-sm text-white transition-all outline-none focus:border-indigo-500/50 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
              >
                <option value="user" className="bg-zinc-900">
                  User
                </option>
                <option value="admin" className="bg-zinc-900">
                  Admin
                </option>
              </select>
              <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                <svg className="h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
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
      <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-indigo-500 opacity-[0.07] blur-2xl" />
      <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-purple-500 opacity-[0.05] blur-2xl" />
    </motion.div>
  )
}
