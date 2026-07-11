import { createClient } from "@/utils/supabase/server";
import { CheckInCard } from "@/components/home/CheckInCard";
import { FiniteFeed } from "@/components/home/FiniteFeed";

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
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-off-white">Today</h1>
        <p className="mt-2 text-muted-foreground">Your daily check-in and curated feed.</p>
      </header>

      <CheckInCard hasCheckedInToday={hasCheckedInToday} />
      
      <FiniteFeed posts={posts || []} />
    </div>
  );
}
