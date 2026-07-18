import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/shared/ui/layout/Navigation";
import { createClient } from "@/shared/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aficionado",
  description: "A premium social media platform designed to connect creators and their fans through immersive, short-form video streaming and direct engagement.",
};

const ADMIN_EMAILS = [
  'devastatingdebater@gmail.com',
  'tamerlanium@gmail.com',
  'support@aficionado.fans',
  'contact@aficionado.fans'
]

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false
  
  let userType: 'aficionado' | 'fan' | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()
    userType = profile?.user_type as 'aficionado' | 'fan' | null
  }

  return (
    <html lang="en" className="dark h-full antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col bg-background text-foreground relative overflow-x-hidden`}
      >
        {/* Ambient Glowing Background Orbs */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px] mix-blend-screen animate-float" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[150px] mix-blend-screen animate-float-delayed" />
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-amber-600/5 blur-[100px] mix-blend-screen animate-float" />
        </div>

        <Navigation isAdmin={isAdmin} userType={userType} />
        <main className="flex-1 md:ml-64 pb-20 md:pb-0 z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
