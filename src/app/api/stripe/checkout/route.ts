import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/shared/lib/supabase/server'
import type { Profile } from '@/shared/types/database'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, creatorId, priceId, amount, message } = body as {
      type?: string
      creatorId?: string
      priceId?: string
      amount?: number   // cents, for tips
      message?: string
    }

    if (!creatorId) {
      return NextResponse.json({ error: 'creatorId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_SITE_URL not set' }, { status: 500 })
    }

    const stripe = getStripe()

    // ── One-time tip ─────────────────────────────────────────────────────
    if (type === 'tip') {
      if (!amount || amount < 100) {
        return NextResponse.json({ error: 'Minimum tip is $1.00' }, { status: 400 })
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: user.email,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'Fan Tip' },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        payment_intent_data: {
          metadata: {
            type: 'tip',
            fan_id: user.id,
            creator_id: creatorId,
            message: message ?? '',
          },
        },
        success_url: `${siteUrl}/creator/${creatorId}?success=true`,
        cancel_url: `${siteUrl}/creator/${creatorId}?canceled=true`,
      })

      return NextResponse.json({ url: session.url })
    }

    // ── Subscription ─────────────────────────────────────────────────────
    if (!priceId) {
      return NextResponse.json({ error: 'priceId is required for subscriptions' }, { status: 400 })
    }

    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('platform_fee_percent')
      .eq('id', creatorId)
      .single<Pick<Profile, 'platform_fee_percent'>>()

    const feePercent = creatorProfile?.platform_fee_percent ?? 20

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { fan_id: user.id, creator_id: creatorId },
        application_fee_percent: feePercent,
      },
      success_url: `${siteUrl}/creator/${creatorId}?success=true`,
      cancel_url: `${siteUrl}/creator/${creatorId}?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Stripe checkout error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
