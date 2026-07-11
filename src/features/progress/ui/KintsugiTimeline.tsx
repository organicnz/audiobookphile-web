interface KintsugiTimelineProps {
  checkIns: any[];
}

export function KintsugiTimeline({ checkIns }: KintsugiTimelineProps) {
  // Generate a mock 14-day history for the visualization
  // In a real app, this would precisely map the dates
  const days = Array.from({ length: 14 }).map((_, i) => {
    // Just simulating some missed days for the kintsugi effect
    const isRepaired = Math.random() > 0.3 || i === 13; 
    return {
      id: i,
      isRepaired
    };
  });

  return (
    <section className="liquid-glass p-6 md:p-8 mt-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-off-white">Kintsugi Journey</h2>
          <p className="text-sm text-muted-foreground mt-1">Every repair makes you stronger and more beautiful.</p>
        </div>
      </div>

      <div className="relative py-12 px-4 overflow-hidden">
        {/* Abstract Kintsugi Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2"></div>
        
        {/* SVG for glowing gold cracks */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <path 
            d="M 0,50 Q 20,40 40,50 T 80,50 T 120,50 T 160,60 T 200,50 T 240,40 T 280,50" 
            fill="none" 
            stroke="rgba(0,240,181,0.3)" 
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="animate-pulse-slow"
          />
        </svg>

        <div className="relative flex justify-between items-center w-full z-10">
          {days.map((day, i) => (
            <div key={day.id} className="relative flex flex-col items-center group">
              {day.isRepaired ? (
                <>
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(0,240,181,0.8)] z-10 transition-transform group-hover:scale-150"></div>
                  {/* Golden repair joint effect */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-8 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 rotate-45"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-8 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 -rotate-45"></div>
                </>
              ) : (
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-white/10 z-10 group-hover:bg-white/30 transition-colors"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground leading-relaxed">
        <strong className="text-off-white font-medium">Philosophy of Repair:</strong> We don't track "streaks" that can be broken and lost. Your missed days are simply cracks in the pottery. By returning today, you have filled those cracks with gold, making your foundation stronger than if it had never broken at all.
      </div>
    </section>
  );
}
