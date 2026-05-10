import SignupForm from './SignupForm'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  return (
    <div className="-mt-[var(--header-height)] flex min-h-full items-center justify-center">
      <SignupForm />
    </div>
  )
}
