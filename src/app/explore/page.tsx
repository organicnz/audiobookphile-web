import { Search, Hash, Star, UserCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function ExplorePage() {
  const supabase = await createClient();

  // Fetch some public profiles (simulating 'featured creators')
  const { data: featuredCreators } = await supabase
    .from('profiles')
    .select('id, avatar_url, ai_tone, bio')
    .limit(5);

  // Fetch some public circles
  const { data: activeCircles } = await supabase
    .from('circles')
    .select('id, name, description')
    .limit(5);

  return (
    <div className="max-w-3xl px-4 py-8 mx-auto lg:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-off-white">Explore</h1>
        <p className="mt-2 text-muted-foreground">Discover creators, rooms, and new challenges.</p>
      </header>

      <div className="relative mb-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search categories..." 
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-off-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      <div className="space-y-12">
        {/* Featured Creators Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-off-white">Featured Creators</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredCreators && featuredCreators.length > 0 ? (
              featuredCreators.map((creator) => (
                <div key={creator.id} className="liquid-glass p-5 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors">
                  {creator.avatar_url ? (
                    <img src={creator.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <UserCircle2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-off-white truncate">{creator.ai_tone || 'User'}</h3>
                    <p className="text-xs text-muted-foreground truncate">{creator.bio || 'Wellness Enthusiast'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No creators found.</p>
            )}
          </div>
        </section>

        {/* Active Circles/Challenges Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Hash className="w-5 h-5 text-deep-plum" />
            <h2 className="text-xl font-semibold text-off-white">Active Circles</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeCircles && activeCircles.length > 0 ? (
              activeCircles.map((circle) => (
                <div key={circle.id} className="liquid-glass p-5 cursor-pointer hover:bg-white/5 transition-colors">
                  <h3 className="text-base font-medium text-off-white truncate mb-1">{circle.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{circle.description || 'A community circle.'}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No active circles found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
