import { FanFeed, type Video } from "@/features/feed/ui/FanFeed";
import { type Drop } from "@/features/feed/ui/DropZoneCarousel";
import { createClient } from "@/shared/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch videos from the 'content' table and join with 'profiles'
  // using maybe 'user_id' or 'creator_id'. Let's assume 'creator_id' or 'user_id'. 
  // Based on actions.ts for check_ins it was 'user_id'. Wait, 'content' might use 'user_id'.
  // We'll select *, profiles!inner(username)
  const { data: contentData } = await supabase
    .from('content')
    .select('id, mux_playback_id, description, likes_count, comments_count, moderation_status, profiles!inner(username)')
    .order('created_at', { ascending: false })
    .limit(10);

  // Map to Video type
  const dbVideos: Video[] = (contentData || []).map((c: any) => ({
    id: c.id,
    creator: c.profiles?.username || 'unknown',
    description: c.description || '',
    playbackId: c.mux_playback_id || '',
    likes: (c.likes_count || 0).toString(),
    comments: (c.comments_count || 0).toString(),
    isSubscribed: false,
    moderationStatus: c.moderation_status || 'approved'
  }));

  // DEMO: Inject a mocked NSFW video
  const demoNsfwVideo: Video = {
    id: 'demo-nsfw-video',
    creator: 'spicy_creator',
    description: 'This video is flagged as adult content. Click to reveal.',
    playbackId: 'qxb01i6T202018GGS2nwgDS7Bzl3Kx1q9e02Tj02mC62h4', // random mux ID for background blur
    likes: '45k',
    comments: '12k',
    isSubscribed: true,
    moderationStatus: 'rejected'
  }

  // DEMO: Inject a mocked Time Capsule video at the top of the feed
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  
  const demoLockedVideo: Video = {
    id: 'demo-locked-video',
    creator: 'aficionado_exclusive',
    description: 'This is a top-secret drop. Set a reminder!',
    playbackId: 'qxb01i6T202018GGS2nwgDS7Bzl3Kx1q9e02Tj02mC62h4', // random mux ID for background blur
    likes: '12k',
    comments: '4.5k',
    isSubscribed: true,
    unlocksAt: futureDate.toISOString()
  }

  const videos = [demoLockedVideo, demoNsfwVideo, ...dbVideos];

  // Fetch drops from the 'posts' table
  const { data: postsData } = await supabase
    .from('posts')
    .select('id, content, created_at, profiles!inner(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(10);

  // Map to Drop type
  const drops: Drop[] = (postsData || []).map((p: any) => ({
    id: p.id,
    creator: p.profiles?.username || 'unknown',
    avatar: p.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${p.profiles?.username || p.id}`,
    hasUnread: true, // simplified
    content: p.content || '',
  }));

  // If no data is available from Supabase (e.g. empty DB), we could fallback to mock data here or just show empty. 
  // We will show empty/whatever is fetched.

  return (
    <div className="h-[100dvh] w-full bg-black">
      <FanFeed videos={videos} drops={drops} />
    </div>
  );
}
