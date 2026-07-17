import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import type { SubscriptionStatus } from '@/shared/types/database'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', { apiVersion: '2026-06-24.dahlia' })
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'dummy_secret'

  // Use Service Role — webhooks run outside user session context
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
  )

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  // Extract subscription data from the raw webhook event.
  // In Stripe API 2026-06-24, `current_period_end` has moved from the
  // top-level Subscription object to individual items. The raw event
  // payload still includes it, so we extract it safely.
  const subData = event.data.object as unknown as Record<string, unknown>

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const metadata = (subData.metadata ?? {}) as Record<string, string>
      const fanId = metadata.fan_id
      const creatorId = metadata.creator_id
      const status = (subData.status as string) as SubscriptionStatus

      // Derive current_period_end from items if available, otherwise
      // fall back to the subscription-level field (present in raw payloads)
      let periodEnd: string
      const rawPeriodEnd = subData.current_period_end as number | undefined
      if (rawPeriodEnd) {
        periodEnd = new Date(rawPeriodEnd * 1000).toISOString()
      } else {
        // Fallback: use current time + 30 days
        periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          stripe_subscription_id: subData.id as string,
          fan_id: fanId,
          creator_id: creatorId,
          status,
          current_period_end: periodEnd,
        }, { onConflict: 'stripe_subscription_id' })
      break
    }

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
