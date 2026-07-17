'use client'

import { useState } from 'react'

interface SubscribeButtonProps {
  creatorId: string
  priceId: string
}

export function SubscribeButton({ creatorId, priceId }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, priceId }),
      })

      const { url, error } = await res.json()

      if (error) throw new Error(error)

      // Redirect to Stripe Checkout
      if (url) window.location.href = url
    } catch (error) {
      console.error('Subscription failed:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-medium transition-all disabled:opacity-50 shadow-[0_4px_14px_0_rgba(0,240,181,0.39)] hover:shadow-[0_6px_20px_rgba(0,240,181,0.5)] active:scale-95"
    >
      {loading ? 'Loading...' : 'Subscribe'}
    </button>
  )
}
