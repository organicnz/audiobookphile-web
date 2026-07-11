import { createClient } from "@/shared/lib/supabase/server";
import { CheckInCard } from "@/features/feed/ui/CheckInCard";
import { FiniteFeed } from "@/features/feed/ui/FiniteFeed";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch recent posts globally (since circle_id IS NULL logic in RLS)
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      created_at,
      profiles:user_id ( avatar_url, ai_tone )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  // Check if checked in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('id')
    .eq('user_id', user?.id)
    .gte('created_at', today.toISOString());

  const hasCheckedInToday = Boolean(checkIns && checkIns.length > 0);

  return (
    <div className="max-w-3xl px-4 py-8 mx-auto lg:py-12">
      <header className="mb-10 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary/80 uppercase tracking-widest mb-1">Your Daily Ritual</p>
            <h1 className="text-3xl font-bold tracking-tight text-off-white">Today</h1>
            <p className="mt-2 text-muted-foreground text-sm">Check in, reflect, and connect — mindfully.</p>
          </div>
          <a 
            href="/breathe" 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full liquid-glass-hover text-primary hover:text-white"
          >
            <span className="relative flex w-3 h-3">
              <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-primary"></span>
              <span className="relative inline-flex w-3 h-3 rounded-full bg-primary"></span>
            </span>
            Breathe
          </a>
        </div>
      </header>

      <CheckInCard hasCheckedInToday={hasCheckedInToday} />
      
      <FiniteFeed posts={posts || []} />
    </div>
  );
}
