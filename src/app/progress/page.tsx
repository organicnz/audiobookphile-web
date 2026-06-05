import { Target, Flame, Calendar, Trophy } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="max-w-3xl px-4 py-8 mx-auto lg:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-off-white">Wellness Cockpit</h1>
        <p className="mt-2 text-muted-foreground">Track your journey and celebrate milestones.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="liquid-glass p-4 text-center">
          <Flame className="w-6 h-6 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-off-white">12</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Day Streak</div>
        </div>
        
        <div className="liquid-glass p-4 text-center">
          <Target className="w-6 h-6 text-deep-plum mx-auto mb-2" />
          <div className="text-2xl font-bold text-off-white">85%</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Goal Met</div>
        </div>

        <div className="liquid-glass p-4 text-center">
          <Calendar className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <div className="text-2xl font-bold text-off-white">24</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Check-ins</div>
        </div>

        <div className="liquid-glass p-4 text-center">
          <Trophy className="w-6 h-6 text-primary mx-auto mb-2 opacity-80" />
          <div className="text-2xl font-bold text-off-white">3</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Badges</div>
        </div>
      </div>

      <section className="liquid-glass p-6">
        <h2 className="text-lg font-medium text-off-white mb-6">Activity Ring</h2>
        <div className="flex items-center justify-center py-8">
          {/* Decorative pseudo-chart */}
          <div className="relative w-48 h-48 rounded-full border-[16px] border-white/5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-[16px] border-primary border-t-transparent border-r-transparent -rotate-45 opacity-80"></div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-off-white">7/10</span>
              <span className="text-sm text-muted-foreground">Days this week</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
