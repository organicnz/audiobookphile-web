import { createClient } from "@/shared/lib/supabase/server";
import { StatCards } from "@/features/progress/ui/StatCards";
import { KintsugiTimeline } from "@/features/progress/ui/KintsugiTimeline";

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all check-ins for the user
  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('created_at')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  const totalCheckIns = checkIns?.length || 0;
  
  // Calculate resilience score (base it on total check-ins and recent consistency)
  const resilienceScore = totalCheckIns * 10 + 50; 

  return (
    <div className="max-w-3xl px-4 py-8 mx-auto lg:py-12">
      <header className="mb-8 animate-fade-in-up">
        <p className="text-sm font-medium text-primary/80 uppercase tracking-widest mb-1">Your Journey</p>
        <h1 className="text-3xl font-bold tracking-tight text-off-white">Wellness Cockpit</h1>
        <p className="mt-2 text-muted-foreground text-sm">Track your journey and celebrate milestones — not streaks.</p>
      </header>

      <StatCards totalCheckIns={totalCheckIns} resilienceScore={resilienceScore} />

      <KintsugiTimeline checkIns={checkIns || []} />
    </div>
  );
}
