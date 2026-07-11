import { UserCircle2 } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/core/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/core/avatar";

interface CuratorCardProps {
  creator: {
    id: string;
    avatar_url: string | null;
    ai_tone: string | null;
    bio: string | null;
  };
  index: number;
}

export function CuratorCard({ creator, index }: CuratorCardProps) {
  return (
    <Card 
      className="liquid-glass-hover border-white/10 cursor-pointer animate-fade-in-up opacity-0 overflow-hidden" 
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <CardContent className="p-5 flex items-center gap-4">
        <Avatar className="w-12 h-12 border border-white/10 shadow-[0_0_15px_rgba(0,240,181,0.3)]">
          <AvatarImage src={creator.avatar_url || ''} alt="Avatar" />
          <AvatarFallback className="bg-white/10">
            <UserCircle2 className="w-6 h-6 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-off-white truncate">{creator.ai_tone || 'User'}</h3>
          <p className="text-xs text-muted-foreground truncate">{creator.bio || 'Wellness Enthusiast'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
