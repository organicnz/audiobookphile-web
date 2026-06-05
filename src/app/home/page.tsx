import { CheckCircle2, UserCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { submitCheckIn } from "./actions";

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

  const hasCheckedInToday = checkIns && checkIns.length > 0;

  return (
    <div className="max-w-3xl px-4 py-8 mx-auto lg:py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-off-white">Today</h1>
        <p className="mt-2 text-muted-foreground">Your daily check-in and curated feed.</p>
      </header>

      {/* Daily Check-in Card */}
      <section className={`p-6 mb-8 liquid-glass transition-opacity ${hasCheckedInToday ? 'opacity-50' : ''}`}>
        <div className="flex items-start justify-between">
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
                <button type="submit" className="px-6 py-2.5 text-sm font-medium transition-colors bg-primary text-primary-foreground rounded-full hover:bg-primary/90">
                  Complete Check-in
                </button>
              </form>
            )}
          </div>
          <div className={`flex items-center justify-center w-16 h-16 rounded-full border border-white/10 ${hasCheckedInToday ? 'bg-primary/20' : 'bg-white/5'}`}>
            <CheckCircle2 className={`w-8 h-8 ${hasCheckedInToday ? 'text-primary' : 'text-primary opacity-50'}`} />
          </div>
        </div>
      </section>

      {/* Finite Feed */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-off-white">Recent Updates</h3>
        
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="p-5 bg-charcoal/30 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                {post.profiles?.avatar_url ? (
                  <img src={post.profiles.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <UserCircle2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-off-white">{post.profiles?.ai_tone || 'User'}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-off-white text-sm whitespace-pre-wrap">{post.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-5 bg-charcoal/30 border border-white/5 rounded-2xl text-center">
            <p className="text-muted-foreground">No updates in your feed right now.</p>
          </div>
        )}
        
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
