import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-3xl">
        <div className="mb-12">
          <Link href="/login" className="inline-flex items-center gap-2 text-bio-teal hover:text-bio-emerald transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_20px_rgba(0,240,181,0.2)]">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
        </div>

        <div className="space-y-8 text-white/80 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p>
              We may collect information you provide directly, such as your name, email address, username, profile details, posts, messages, payment information, and support requests. We may also collect device information, IP address, browser type, app usage data, cookies, and approximate location data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Information</h2>
            <p>
              We use information to operate the Service, create and secure accounts, personalize content, support creator tools, process payments, prevent abuse, communicate with users, comply with legal obligations, and improve our products and features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Share Information</h2>
            <p>
              We may share information with service providers, payment processors, analytics providers, legal authorities when required, and other users as needed to provide social features. We do not sell personal information unless we clearly disclose that practice and provide the required choices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. User Content and Visibility</h2>
            <p>
              Content you post may be visible to other users, followers, or the public depending on your settings and the feature you use. You should avoid posting sensitive information unless you are comfortable with it being visible to others.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Cookies and Tracking</h2>
            <p>
              We use cookies, pixels, SDKs, and similar technologies to remember preferences, measure performance, analyze usage, and help protect the Service. You may be able to manage some cookies through browser settings or in-app controls depending on your device and region.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
            <p>
              We retain information for as long as needed to provide the Service, comply with legal obligations, resolve disputes, enforce agreements, and support platform safety and security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights and Choices</h2>
            <p>
              Depending on where you live, you may have rights to access, correct, delete, or receive a copy of certain personal information, and to object to or restrict certain processing. You may also be able to update some information through your account settings or contact us for help.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Children’s Privacy</h2>
            <p>
              The Service is not intended for children under 18, and we do not knowingly collect personal information from children under 18 without parental consent where required by law. If we learn that such information was collected, we may delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Security</h2>
            <p>
              We use reasonable administrative, technical, and physical safeguards to protect personal information, but no system is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. International Transfers</h2>
            <p>
              If you access the Service outside the country where our servers or operations are located, your information may be transferred to and processed in other jurisdictions with different privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the effective date and may provide additional notice where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
            <p>
              Questions about this Privacy Policy may be sent to: [Privacy Contact Email:support@aficionado.fans].
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
