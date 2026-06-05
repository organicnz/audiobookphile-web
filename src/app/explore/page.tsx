import { Search, Hash, Star } from "lucide-react";

export default function ExplorePage() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="liquid-glass p-6 group cursor-pointer hover:bg-white/5 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-4">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-off-white mb-2">Featured Creators</h3>
          <p className="text-sm text-muted-foreground">Find inspiring individuals sharing their wellness journeys.</p>
        </div>

        <div className="liquid-glass p-6 group cursor-pointer hover:bg-white/5 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-deep-plum/50 text-deep-plum flex items-center justify-center mb-4 border border-deep-plum/30">
            <Hash className="w-6 h-6 text-off-white" />
          </div>
          <h3 className="text-lg font-medium text-off-white mb-2">Active Challenges</h3>
          <p className="text-sm text-muted-foreground">Join community-driven goals and build your streak.</p>
        </div>
      </div>
    </div>
  );
}
