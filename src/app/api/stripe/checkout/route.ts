import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/shared/lib/supabase/server'
import type { Profile } from '@/shared/types/database'

export async function POST(req: Request) {
  try {
    const { creatorId, priceId } = await req.json()
    const supabase = await createClient()

    // Get the current user (the fan subscribing)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the creator's dynamic fee tier
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('platform_fee_percent')
      .eq('id', creatorId)
      .single<Pick<Profile, 'platform_fee_percent'>>()

    const feePercent = creatorProfile?.platform_fee_percent ?? 20

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Pass metadata so the webhook can write to Supabase
      subscription_data: {
        metadata: {
          fan_id: user.id,
          creator_id: creatorId,
        },
        application_fee_percent: feePercent,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/creator/${creatorId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/creator/${creatorId}?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creating checkout session:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
