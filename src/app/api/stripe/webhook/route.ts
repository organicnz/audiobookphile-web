import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import type { SubscriptionStatus } from '@/shared/types/database'

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables for Stripe webhook')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2026-06-24.dahlia' })

  // Use Service Role — webhooks run outside user session context
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  const subData = event.data.object as unknown as Record<string, unknown>

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const metadata = (subData.metadata ?? {}) as Record<string, string>
      const fanId = metadata.fan_id
      const creatorId = metadata.creator_id
      const status = (subData.status as string) as SubscriptionStatus

      if (!fanId || !creatorId) {
        console.error('Missing fan_id or creator_id in subscription metadata', metadata)
        break
      }

      const rawPeriodEnd = subData.current_period_end as number | undefined
      const periodEnd = rawPeriodEnd
        ? new Date(rawPeriodEnd * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          stripe_subscription_id: subData.id as string,
          fan_id: fanId,
          creator_id: creatorId,
          status,
          current_period_end: periodEnd,
        }, { onConflict: 'stripe_subscription_id' })

      if (error) console.error('Supabase upsert error:', error.message)
      break
    }

    case 'payment_intent.succeeded': {
      // Handle one-time tips
      const pi = subData as unknown as Stripe.PaymentIntent
      const metadata = pi.metadata ?? {}
      if (metadata.type === 'tip') {
        const { error } = await supabaseAdmin
          .from('tips')
          .insert({
            stripe_payment_intent_id: pi.id,
            fan_id: metadata.fan_id,
            creator_id: metadata.creator_id,
            amount: pi.amount,
            message: metadata.message ?? '',
          })
          .select()
        if (error) console.error('Tip insert error:', error.message)
      }
      break
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
