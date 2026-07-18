import { CreatorStudio } from "@/features/studio/ui/CreatorStudio";
import { createClient } from "@/shared/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CreatorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profile?.user_type === "fan") {
      redirect("/home");
    }
  } else {
    redirect("/login");
  }

  // Fetch active subscriber count
  const { count, error } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", user.id)
    .eq("status", "active");

  const activeSubscribers = count || 0;

  return (
    <div className="min-h-screen bg-background">
      <CreatorStudio activeSubscribers={activeSubscribers} />
    </div>
  );
}
