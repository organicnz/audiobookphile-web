import React from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export default function CreatorAgreementPage() {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-3xl">
        <div className="mb-12">
          <Link href="/login" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <FileText className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="text-4xl font-black text-white">Creator Agreement</h1>
        </div>

        <div className="space-y-8 text-white/80 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Purpose</h2>
            <p>
              This Creator Agreement applies to users who participate in creator tools, monetization features, sponsored content opportunities, affiliate promotions, or brand partnerships on Aficionado.Fans.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility</h2>
            <p>
              To use creator features, you must have an approved account and provide accurate payment, tax, and identity information where required by law or platform policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Scope of Work</h2>
            <p>
              Creator will provide the content, posts, videos, images, livestreams, stories, or other deliverables described in the applicable campaign brief, offer, or order form. Deliverables should specify format, quantity, deadlines, publishing dates, and any required tags or captions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Payment</h2>
            <p>
              Payment terms must be stated in the campaign terms and may include cash, revenue share, subscriptions, tips, bonuses, or gifts. If payment depends on performance metrics, the formula and timing should be clearly defined.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Disclosure Requirements</h2>
            <p>
              Creator must clearly and conspicuously disclose any paid partnership, sponsorship, gifted product, affiliate relationship, or other material connection in the content itself, not buried in a profile or hidden behind extra clicks.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Content Standards</h2>
            <p>
              Creator represents that submitted content will be lawful, original or properly licensed, non-infringing, and not misleading. Creator must not make false claims about products, services, or experiences in sponsored content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Review and Revisions</h2>
            <p>
              If Aficionado.Fans or a brand partner has approval rights, Creator will submit drafts according to the timeline in the campaign terms. The number of revision rounds should be limited and clearly stated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Ownership and License</h2>
            <p>
              Creator retains ownership of original content unless a separate written transfer is agreed. Creator grants Aficionado.Fans a worldwide, royalty-free, sublicensesable license to host, reproduce, display, distribute, adapt, and promote the content for platform operation, marketing, and discovery features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Exclusivity</h2>
            <p>
              If exclusivity applies, it must be stated clearly, including the brand category, length of restriction, and whether it applies before, during, or after the campaign.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Takedown and Termination</h2>
            <p>
              Aficionado.Fans may remove content or suspend creator privileges if content violates this Agreement, platform policies, or applicable law. Either party may terminate as permitted by the applicable campaign terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Indemnification</h2>
            <p>
              Creator agrees to defend and indemnify Aficionado.Fans against claims arising from Creator’s breach of this Agreement, including rights violations, false advertising claims, or failure to disclose required relationships.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Governing Law</h2>
            <p>
              This Agreement is governed by the laws of Delaware and California states). Any dispute resolution method should be specified in the campaign terms or platform rules.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
