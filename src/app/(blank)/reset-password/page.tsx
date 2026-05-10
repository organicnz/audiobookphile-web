import ResetPasswordForm from './ResetPasswordForm'

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  return (
    <div className="-mt-[var(--header-height)] flex min-h-full items-center justify-center">
      <ResetPasswordForm />
    </div>
  )
}
