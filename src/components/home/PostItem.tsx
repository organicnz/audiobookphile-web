import { UserCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostItemProps {
  post: any;
  index: number;
}

export function PostItem({ post, index }: PostItemProps) {
  const profile = (Array.isArray(post.profiles) ? post.profiles[0] : post.profiles) as any;
  
  return (
    <Card 
      className="liquid-glass-hover border-white/10 rounded-2xl animate-fade-in-up opacity-0 overflow-hidden" 
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10 border border-white/10">
            <AvatarImage src={profile?.avatar_url || ''} alt="Avatar" />
            <AvatarFallback className="bg-white/10">
              <UserCircle2 className="w-6 h-6 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium text-off-white">{profile?.ai_tone || 'User'}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-off-white text-sm whitespace-pre-wrap">{post.content}</p>
        </div>
      </CardContent>
    </Card>
  );
}
