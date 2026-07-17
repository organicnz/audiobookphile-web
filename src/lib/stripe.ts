import Stripe from 'stripe'

let _stripe: Stripe | null = null

/**
 * Lazily initialised Stripe client singleton.
 * Deferred to avoid throwing during Next.js static page collection
 * when STRIPE_SECRET_KEY is not yet configured.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is missing. Please set the environment variable.')
    }

    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-06-24.dahlia',
      appInfo: {
        name: 'Aficionado.fans',
        version: '0.1.0',
      },
    })
  }

  return _stripe
}
