import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PostItem } from "./PostItem";

interface FiniteFeedProps {
  posts: any[];
}

export function FiniteFeed({ posts }: FiniteFeedProps) {
  return (
    <section className="space-y-6">
      <h3 className="text-lg font-medium text-off-white">Recent Updates</h3>
      
      {posts && posts.length > 0 ? (
        posts.map((post, index) => (
          <PostItem key={post.id} post={post} index={index} />
        ))
      ) : (
        <Card className="liquid-glass border-white/10 text-center animate-fade-in-up overflow-hidden">
          <CardContent className="p-8">
            <p className="text-muted-foreground font-medium">No updates in your feed right now.</p>
          </CardContent>
        </Card>
      )}
      
      <div className="py-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-white/5">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
        <h4 className="text-lg font-medium text-off-white">You're all caught up!</h4>
        <p className="mt-1 text-sm text-muted-foreground">You've seen all the updates for today.</p>
      </div>
    </section>
  );
}
