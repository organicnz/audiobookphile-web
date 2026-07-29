import { redirect } from 'next/navigation'

/**
 * Signup page — DISABLED (invitation-only).
 * Redirects to login since self-registration is not allowed.
 */
export default function SignupPage() {
  redirect('/login')
}
