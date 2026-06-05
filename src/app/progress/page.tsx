import { Target, Flame, Calendar, Trophy } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

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
  
  // Calculate basic streak (simplistic calculation for now)
  let currentStreak = 0;
  if (checkIns && checkIns.length > 0) {
    // If the most recent check-in was today or yesterday, streak is at least 1
    const mostRecent = new Date(checkIns[0].created_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    mostRecent.setHours(0,0,0,0);
    
    if (mostRecent.getTime() === today.getTime() || mostRecent.getTime() === yesterday.getTime()) {
      currentStreak = 1;
      // In a real app we'd iterate backwards checking consecutive days
    }
  }

  // Calculate days this week
  let daysThisWeek = 0;
  if (checkIns) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const checkInsThisWeek = checkIns.filter(ci => new Date(ci.created_at) >= startOfWeek);
    // Get unique days
    const uniqueDays = new Set(checkInsThisWeek.map(ci => new Date(ci.created_at).toDateString()));
    daysThisWeek = uniqueDays.size;
  }

  return (
    <div className="max-w-3xl px-4 py-8 mx-auto lg:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-off-white">Wellness Cockpit</h1>
        <p className="mt-2 text-muted-foreground">Track your journey and celebrate milestones.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="liquid-glass p-4 text-center">
          <Flame className="w-6 h-6 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-off-white">{currentStreak}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Day Streak</div>
        </div>
        
        <div className="liquid-glass p-4 text-center">
          <Target className="w-6 h-6 text-deep-plum mx-auto mb-2" />
          <div className="text-2xl font-bold text-off-white">{totalCheckIns > 0 ? 'Active' : 'New'}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Status</div>
        </div>

        <div className="liquid-glass p-4 text-center">
          <Calendar className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <div className="text-2xl font-bold text-off-white">{totalCheckIns}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Check-ins</div>
        </div>

        <div className="liquid-glass p-4 text-center">
          <Trophy className="w-6 h-6 text-primary mx-auto mb-2 opacity-80" />
          <div className="text-2xl font-bold text-off-white">{Math.floor(totalCheckIns / 7)}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Badges</div>
        </div>
      </div>

      <section className="liquid-glass p-6">
        <h2 className="text-lg font-medium text-off-white mb-6">Activity Ring</h2>
        <div className="flex items-center justify-center py-8">
          {/* Decorative pseudo-chart */}
          <div className="relative w-48 h-48 rounded-full border-[16px] border-white/5 flex items-center justify-center">
            {daysThisWeek > 0 && (
              <div 
                className="absolute inset-0 rounded-full border-[16px] border-primary border-t-transparent border-r-transparent -rotate-45 opacity-80"
                style={{ clipPath: `polygon(50% 50%, 50% 0%, ${daysThisWeek > 3 ? '100% 0%' : '50% 0%'})` }} // Very simplified visualization for now
              ></div>
            )}
            <div className="text-center">
              <span className="block text-3xl font-bold text-off-white">{daysThisWeek}/7</span>
              <span className="text-sm text-muted-foreground">Days this week</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
