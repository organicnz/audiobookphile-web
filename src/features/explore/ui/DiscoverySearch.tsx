'use client'

import { Search } from "lucide-react";
import { Input } from "@/shared/ui/core/input";

export function DiscoverySearch() {
  return (
    <div className="relative mb-10">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
      <Input 
        type="text" 
        placeholder="Discover specific topics..." 
        className="w-full pl-10 pr-4 py-6 bg-white/5 border-white/10 rounded-xl text-off-white placeholder:text-muted-foreground focus-visible:ring-primary/50 focus-visible:border-primary/50 focus-visible:shadow-[0_0_25px_rgba(0,240,181,0.2)] transition-all duration-300"
      />
    </div>
  );
}
