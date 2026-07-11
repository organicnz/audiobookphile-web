import { Heart, Users } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="liquid-glass p-8 text-center mt-8 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
        <Heart className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-lg font-medium text-off-white mb-2">Find Your People</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
        Recovery is never a solo journey. Join a circle of people who understand what you're going through.
      </p>
      <button className="px-6 py-2.5 text-sm font-semibold rounded-full bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 hover:shadow-[0_0_20px_rgba(0,240,181,0.15)] transition-all duration-300 active:scale-95">
        Browse Public Circles
      </button>
    </div>
  )
}
