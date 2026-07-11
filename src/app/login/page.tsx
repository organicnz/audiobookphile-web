import { Suspense } from 'react'
import { AuthForm } from '@/features/auth/ui/AuthForm'

export default function LoginPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Immersive background for login */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[150px] animate-breathe-calm mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-bio-emerald/8 blur-[120px] animate-float mix-blend-screen" />
      </div>

      {/* Brand */}
      <div className="z-10 mb-8 text-center animate-fade-in-up">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-bio-teal via-primary to-bio-emerald">
          Aficionado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
          The anti-dopamine social network. Heal together, grow stronger.
        </p>
      </div>

      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-96 bg-white/5 rounded-3xl" />}>
        <AuthForm />
      </Suspense>

      {/* Footer tagline */}
      <p className="z-10 mt-8 text-xs text-muted-foreground/60 text-center max-w-sm animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
        Your journey matters. Every check-in is gold poured into your cracks.
      </p>
    </div>
  )
}
