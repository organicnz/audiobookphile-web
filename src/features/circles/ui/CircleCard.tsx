import { Card, CardContent } from "@/shared/ui/core/card"
import { Avatar, AvatarFallback } from "@/shared/ui/core/avatar"
import { Badge } from "@/shared/ui/core/badge"
import { Users, Lock } from "lucide-react"

export function CircleCard({ circle, index }: { circle: any, index: number }) {
  return (
    <Card 
      className="liquid-glass-hover border-white/10 group cursor-pointer animate-fade-in-up opacity-0 overflow-hidden" 
      style={{ animationDelay: `${(index + 3) * 100}ms`, animationFillMode: 'forwards' }}
    >
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ocean-muted to-ocean-deep flex items-center justify-center border border-white/10 shadow-inner">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-off-white flex items-center gap-2 mb-1">
              {circle.name} <Lock className="w-3 h-3 text-muted-foreground" />
            </h3>
            <Badge variant="secondary" className="bg-white/5 text-muted-foreground hover:bg-white/10 border-white/10 font-normal">Active circle</Badge>
          </div>
        </div>
        <div className="flex -space-x-2">
          <Avatar className="w-8 h-8 border-2 border-charcoal">
            <AvatarFallback className="bg-charcoal"></AvatarFallback>
          </Avatar>
          <Avatar className="w-8 h-8 border-2 border-charcoal">
            <AvatarFallback className="bg-charcoal"></AvatarFallback>
          </Avatar>
          <Avatar className="w-8 h-8 border-2 border-charcoal">
            <AvatarFallback className="bg-charcoal text-[10px] text-muted-foreground">+2</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
    </Card>
  )
}
