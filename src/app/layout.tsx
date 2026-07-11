import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aficionado - Wellness & Community",
  description: "A short-form, cross-platform social app and digital wellness tool.",
};

import { createClient } from "@/utils/supabase/server";

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

  return (
    <html lang="en" className="dark h-full antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col bg-background text-foreground relative overflow-x-hidden`}
      >
        {/* Ambient Glowing Background Orbs */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/40 blur-[120px] mix-blend-screen animate-breathe-calm"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[150px] mix-blend-screen animate-float"></div>
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] mix-blend-screen animate-heartbeat-resting"></div>
        </div>

        <Navigation isAdmin={isAdmin} />
        <main className="flex-1 md:ml-64 pb-20 md:pb-0 z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
