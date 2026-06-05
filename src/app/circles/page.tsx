import { Users, Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function CirclesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch circles the user is a member of
  const { data: memberships } = await supabase
    .from('circle_members')
    .select(`
      circles (
        id,
        name,
        description
      )
    `)
    .eq('user_id', user?.id);

  const myCircles = memberships?.map(m => m.circles) || [];

  return (
    <div className="max-w-3xl px-4 py-8 mx-auto lg:py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-off-white">Circles</h1>
          <p className="mt-2 text-muted-foreground">Your private accountability groups.</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium transition-colors bg-white/10 text-off-white rounded-full hover:bg-white/20">
          Create Circle
        </button>
      </header>

      <div className="space-y-4">
        {myCircles.length > 0 ? (
          myCircles.map((circle: any) => (
            <div key={circle.id} className="liquid-glass p-5 flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-deep-plum flex items-center justify-center border border-white/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-off-white flex items-center gap-2">
                    {circle.name} <Lock className="w-3 h-3 text-muted-foreground" />
                  </h3>
                  <p className="text-sm text-muted-foreground">Active circle</p>
                </div>
              </div>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-charcoal border-2 border-[#121212]"></div>
                <div className="w-8 h-8 rounded-full bg-charcoal border-2 border-[#121212]"></div>
                <div className="w-8 h-8 rounded-full bg-charcoal border-2 border-[#121212] flex items-center justify-center text-[10px] text-muted-foreground">+2</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">You haven't joined any circles yet.</p>
        )}

        <div className="p-6 border border-dashed border-white/20 rounded-2xl text-center mt-8">
          <p className="text-muted-foreground mb-4">Looking for more support?</p>
          <button className="text-primary font-medium hover:underline">
            Browse public circles
          </button>
        </div>
      </div>
    </div>
  );
}
