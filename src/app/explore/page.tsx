import { Hash, Star } from "lucide-react";
import { createClient } from "@/shared/lib/supabase/server";
import { DiscoverySearch } from "@/features/explore/ui/DiscoverySearch";
import { CuratorCard } from "@/features/explore/ui/CuratorCard";
import { CircleHighlight } from "@/features/explore/ui/CircleHighlight";

export default async function ExplorePage() {
  const supabase = await createClient();

  // Fetch only a strictly curated, finite number of items
  const { data: featuredCreators } = await supabase
    .from('profiles')
    .select('id, avatar_url, ai_tone, bio')
    .limit(4); // Strictly limit to 4 per day

  const { data: activeCircles } = await supabase
    .from('circles')
    .select('id, name, description')
    .limit(4); // Strictly limit to 4 per day

  return (
    <div className="max-w-3xl px-4 py-8 mx-auto lg:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-off-white">Daily Discovery</h1>
        <p className="mt-2 text-muted-foreground">A finite, curated selection for today. No endless scrolling.</p>
      </header>

      <DiscoverySearch />

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-off-white">Today's Voices</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredCreators && featuredCreators.length > 0 ? (
              featuredCreators.map((creator, index) => (
                <CuratorCard key={creator.id} creator={creator} index={index} />
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No creators found today.</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Hash className="w-5 h-5 text-bio-emerald" />
            <h2 className="text-xl font-semibold text-off-white">Featured Circles</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeCircles && activeCircles.length > 0 ? (
              activeCircles.map((circle, index) => (
                <CircleHighlight key={circle.id} circle={circle} index={index} />
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No active circles found.</p>
            )}
          </div>
        </section>
        
        {/* Anti-Dopamine Stopper */}
        <div className="pt-16 pb-8 text-center animate-fade-in-up" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
          <div className="w-12 h-1 bg-white/10 mx-auto rounded-full mb-6"></div>
          <h3 className="text-lg font-medium text-off-white mb-2">You're all caught up.</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            We don't do infinite feeds here. You've seen today's curation. Put down your phone, take a deep breath, and go live your life.
          </p>
        </div>
      </div>
    </div>
  );
}
