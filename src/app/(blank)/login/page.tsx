import LoginForm from './LoginForm'

export default async function LoginPage() {
  return (
    <div className="-mt-[var(--header-height)] flex min-h-full items-center justify-center">
      <LoginForm />
    </div>
  )
}
