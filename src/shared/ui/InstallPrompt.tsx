'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function InstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  if (!isInstallable || isInstalled) return null

  return (
    <div className="animate-in slide-in-from-bottom-5 fade-in fixed bottom-20 left-1/2 z-50 -translate-x-1/2 duration-300">
      <div className="bg-primary/90 text-primary-foreground border-primary-foreground/20 flex items-center space-x-4 rounded-full border px-6 py-3 shadow-lg backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-sm font-semibold">Install Audiobookphile</span>
          <span className="text-xs opacity-80">Add to home screen for offline listening</span>
        </div>
        <button
          type="button"
          onClick={handleInstallClick}
          className="bg-background text-foreground hover:bg-background/90 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
        >
          Install
        </button>
        <button
          type="button"
          aria-label="Dismiss install prompt"
          onClick={() => setIsInstallable(false)}
          className="rounded-full p-2 opacity-60 transition-opacity hover:opacity-100"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
