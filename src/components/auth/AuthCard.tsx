import { mergeClasses } from '@/lib/merge-classes'

interface AuthCardProps {
  /** Card title */
  title: string
  /** Optional subtitle shown below the title */
  subtitle?: string
  /** Optional material-symbols icon name shown above the title */
  icon?: string
  /** Render as a <form> element when provided; plain <div> otherwise */
  onSubmit?: (e: React.FormEvent) => void
  children: React.ReactNode
  className?: string
}

/**
 * Shared card shell used by all auth pages (login, signup, forgot/reset password, verify email).
 * Renders as a <form> when `onSubmit` is provided, otherwise as a <div>.
 */
export default function AuthCard({ title, subtitle, icon, onSubmit, children, className }: AuthCardProps) {
  const cardClass = mergeClasses(
    'bg-bg border-border w-full max-w-md rounded-lg border p-10 shadow-lg',
    icon || subtitle ? 'text-center' : '',
    className
  )

  const header = (
    <>
      {icon && (
        <span className="material-symbols text-primary mb-4 block text-5xl" aria-hidden="true">
          {icon}
        </span>
      )}
      <h1 className={mergeClasses('text-2xl font-bold', subtitle ? 'mb-2' : 'mb-6')}>{title}</h1>
      {subtitle && (
        <p className="text-foreground-muted mb-6 text-sm">{subtitle}</p>
      )}
    </>
  )

  if (onSubmit) {
    return (
      <form onSubmit={onSubmit} className={cardClass}>
        {header}
        {children}
      </form>
    )
  }

  return (
    <div className={cardClass}>
      {header}
      {children}
    </div>
  )
}
