import { CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-3xl px-4 py-8 mx-auto lg:py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-off-white">Today</h1>
        <p className="mt-2 text-muted-foreground">Your daily check-in and curated feed.</p>
      </header>

      {/* Daily Check-in Card */}
      <section className="p-6 mb-8 liquid-glass">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-off-white mb-2">Daily Check-in</h2>
            <p className="text-sm text-muted-foreground mb-4">How are you feeling today? Take a moment to reflect on your goals.</p>
            <button className="px-6 py-2.5 text-sm font-medium transition-colors bg-primary text-primary-foreground rounded-full hover:bg-primary/90">
              Complete Check-in
            </button>
          </div>
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10">
            <CheckCircle2 className="w-8 h-8 text-primary opacity-50" />
          </div>
        </div>
      </section>

      {/* Finite Feed */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-off-white">Recent Updates</h3>
        
        {/* Placeholder for finite feed items */}
        {[1, 2, 3].map((item) => (
          <div key={item} className="p-5 bg-charcoal/30 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/10"></div>
              <div>
                <div className="h-4 w-24 bg-white/10 rounded mb-1"></div>
                <div className="h-3 w-16 bg-white/5 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/10 rounded"></div>
              <div className="h-4 w-5/6 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
        
        <div className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-white/5">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <h4 className="text-lg font-medium text-off-white">You're all caught up!</h4>
          <p className="mt-1 text-sm text-muted-foreground">You've seen all the updates for today.</p>
        </div>
      </section>
    </div>
  );
}
