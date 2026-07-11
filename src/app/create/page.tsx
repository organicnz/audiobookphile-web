import { ComposeForm } from "@/features/studio/ui/ComposeForm";
import { Shield } from "lucide-react";

export default function CreatePage() {
  return (
    <div className="max-w-2xl px-4 py-8 mx-auto lg:py-12">
      <header className="mb-8 animate-fade-in-up">
        <p className="text-sm font-medium text-primary/80 uppercase tracking-widest mb-1">Express Yourself</p>
        <h1 className="text-3xl font-bold tracking-tight text-off-white">Studio</h1>
        <p className="mt-2 text-muted-foreground text-sm">Share an update with your circles or followers.</p>
      </header>

      <ComposeForm />
      
      <div className="flex items-center justify-center gap-2 mt-8 px-8 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        <Shield className="w-3.5 h-3.5 text-primary/50" />
        <p className="text-xs text-muted-foreground/60">
          All content passes through AI moderation to ensure a safe, trigger-free environment.
        </p>
      </div>
    </div>
  );
}
