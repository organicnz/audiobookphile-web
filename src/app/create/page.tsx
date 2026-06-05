import { ImagePlus, Send } from "lucide-react";

export default function CreatePage() {
  return (
    <div className="max-w-2xl px-4 py-8 mx-auto lg:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-off-white">Studio</h1>
        <p className="mt-2 text-muted-foreground">Share an update with your circles or followers.</p>
      </header>

      <div className="liquid-glass p-6">
        <textarea 
          className="w-full h-32 bg-transparent border-none resize-none text-off-white placeholder:text-muted-foreground focus:outline-none text-lg"
          placeholder="What's on your mind today?"
        ></textarea>
        
        <div className="h-px w-full bg-white/10 my-4"></div>
        
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-off-white transition-colors">
            <ImagePlus className="w-5 h-5" />
            <span className="text-sm font-medium">Add Media</span>
          </button>
          
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium">
            <span>Publish</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-xs text-center text-muted-foreground mt-6 px-8">
        All content passes through our automated moderation gate to ensure a safe, trigger-free environment.
      </p>
    </div>
  );
}
