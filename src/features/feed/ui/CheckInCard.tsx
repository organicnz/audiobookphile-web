import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/core/card";
import { submitCheckIn } from "@/app/home/actions";

interface CheckInCardProps {
  hasCheckedInToday: boolean;
}

export function CheckInCard({ hasCheckedInToday }: CheckInCardProps) {
  return (
    <Card className={`mb-10 liquid-glass-hover border-white/10 transition-all duration-500 animate-fade-in-up overflow-hidden ${hasCheckedInToday ? 'opacity-60 grayscale-[0.3]' : ''}`}>
      <CardContent className="p-8 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-off-white mb-2">
            {hasCheckedInToday ? 'Check-in Complete' : 'Daily Check-in'}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {hasCheckedInToday 
              ? "You've already reflected on your goals today. Great job!" 
              : "How are you feeling today? Take a moment to reflect on your goals."}
          </p>
          {!hasCheckedInToday && (
            <form action={submitCheckIn}>
              <button type="submit" className="px-6 py-2.5 text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-primary to-bio-emerald text-primary-foreground rounded-full shadow-[0_4px_14px_0_rgba(0,240,181,0.39)] hover:shadow-[0_6px_20px_rgba(0,240,181,0.5)] hover:-translate-y-0.5 active:scale-95">
                Complete Check-in
              </button>
            </form>
          )}
        </div>
        <div className={`flex items-center justify-center w-16 h-16 rounded-full border border-white/10 ${hasCheckedInToday ? 'bg-primary/20' : 'bg-white/5'}`}>
          <CheckCircle2 className={`w-8 h-8 ${hasCheckedInToday ? 'text-primary' : 'text-primary opacity-50'}`} />
        </div>
      </CardContent>
    </Card>
  );
}
