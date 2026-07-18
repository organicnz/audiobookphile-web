import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-3xl">
        <div className="mb-12">
          <Link href="/login" className="inline-flex items-center gap-2 text-bio-teal hover:text-bio-emerald transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-bio-teal/20 flex items-center justify-center border border-bio-teal/50 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
            <Shield className="w-6 h-6 text-bio-teal" />
          </div>
          <h1 className="text-4xl font-black text-white">Terms of Use</h1>
        </div>

        <div className="space-y-8 text-white/80 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Aficionado.Fans, including browsing, registering, posting, messaging, following creators, or using monetization features, you agree to these Terms of Use and any additional policies referenced here, including our Privacy Policy, Community Guidelines, and Creator Agreement where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility</h2>
            <p>
              You must be at least 18 years old, or older if required by the laws of your country, to use the Service. By using the Service, you represent that you are legally able to enter into this agreement and that the information you provide is accurate and complete.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Accounts and Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You agree to notify us promptly if you suspect unauthorized access or other security issues.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Our Service</h2>
            <p>
              Aficionado.Fans provides social media features that may include profiles, posts, comments, messaging, creator tools, subscriptions, and other interactive features. We may change, suspend, or discontinue parts of the Service at any time, subject to applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. User Content</h2>
            <p>
              You retain ownership of content you submit, upload, or post, but you grant Aficionado.Fans a worldwide, non-exclusive, royalty-free, transferable, sublicencesable license to host, store, reproduce, display, distribute, modify, adapt, publish, and otherwise use your content for operating, improving, promoting, and developing the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Content Responsibility</h2>
            <p>
              You are solely responsible for the content you post and for your interactions with other users. You represent that you own or have the necessary rights to your content and that your content does not violate any law or third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Prohibited Conduct</h2>
            <p>
              You may not use the Service to post illegal, harmful, harassing, hateful, deceptive, infringing, sexually exploitative, or otherwise objectionable content. You may not spam, impersonate others, scrape the Service, interfere with platform security, or attempt unauthorized access to our systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Creator Content</h2>
            <p>
              If you use creator tools, monetize content, accept gifts, or participate in sponsored or affiliate activity, you must comply with our Creator Agreement and all disclosure requirements, including clear and conspicuous disclosures of paid partnerships, gifted products, and affiliate relationships.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Moderation and Enforcement</h2>
            <p>
              We may remove content, reduce reach, limit features, suspend accounts, or terminate access if we believe you violated these Terms, our policies, or applicable law. We may also act against repeat infringers or users who repeatedly violate platform rules.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Intellectual Property</h2>
            <p>
              The Service, including software, branding, design, logos, and trademarks, is owned by Aficionado.Fans or its licensors and protected by law. You may not use our branding or platform materials without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Copyright Complaints</h2>
            <p>
              If you believe content on the Service infringes your copyright, you may send a notice to our designated copyright contact with the information required by law. If content is removed and you believe that was a mistake, you may submit a counter-notification under applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Third-Party Links and Services</h2>
            <p>
              The Service may link to or integrate third-party products or services. We are not responsible for third-party content, policies, or practices, and your use of third-party services is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Disclaimers</h2>
            <p>
              The Service is provided on an “as is” and “as available” basis. We do not promise uninterrupted, error-free, or fully secure operation, and we disclaim warranties to the maximum extent permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Aficionado.Fans will not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">15. Indemnification</h2>
            <p>
              You agree to defend and indemnify Aficionado.Fans against claims arising from your content, your use of the Service, your violation of these Terms, or your violation of applicable law or third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">16. Governing Law and Disputes</h2>
            <p>
              These Terms are governed by the laws of Delaware and /or California States, without regard to conflict-of-law rules. Dispute resolution will be handled in the forum or method selected by Aficionado.Fans, unless mandatory law requires otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">17. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. When we do, we will update the effective date, and your continued use of the Service after the updated Terms become effective means you accept them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">18. Contact Information</h2>
            <p>
              Questions about these Terms may be sent to: support@aficionado.fans
            </p>
          </section>

          <hr className="border-white/10 my-8" />

          {/* COMMUNITY GUIDELINES SECTION */}
          <h1 className="text-4xl font-black text-white mt-12 mb-8">Community Guidelines</h1>
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Respect Other People</h2>
            <p>
              Treat other users, creators, and employees with respect. Harassment, bullying, threats, stalking, and abusive behavior are not allowed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. No Illegal or Harmful Content</h2>
            <p>
              Do not post content that promotes violence, fraud, exploitation, self-harm, or illegal activity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. No Hate or Discrimination</h2>
            <p>
              Content attacking people based on race, ethnicity, nationality, religion, disability, gender, sexual orientation, or other protected characteristics is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. No Sexual Exploitation</h2>
            <p>
              We do not allow sexual exploitation, coercion, non-consensual intimate content, grooming, trafficking-related content, or content that exploits minors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. No Spam or Manipulation</h2>
            <p>
              Do not spam, impersonate others, use bots to mislead users, or manipulate platform metrics or engagement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Respect Intellectual Property</h2>
            <p>
              Only upload content you created or have permission to use. Do not upload copyrighted content without authorization.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Creator Conduct</h2>
            <p>
              Creators must follow disclosure rules for paid partnerships, gifted products, sponsorships, and affiliate links. Disclosures must be clear, visible, and easy to understand.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Enforcement</h2>
            <p>
              We may remove content, reduce reach, issue warnings, suspend accounts, or terminate access for guideline violations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Reporting Violations</h2>
            <p>
              Users may report content or accounts that appear to violate these Guidelines. We may review reports and take action at our discretion.
            </p>
          </section>

          <hr className="border-white/10 my-8" />

          {/* DMCA SECTION */}
          <h1 className="text-4xl font-black text-white mt-12 mb-8">DMCA Policy</h1>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Copyright Respect</h2>
            <p>
              Aficionado.Fans respects copyright and expects users to do the same.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Designated Agent</h2>
            <p>
              Our designated copyright contact is: [ DMCA Agent Name: AficionadoFansMediia Inc. / Email: support@aficionado.fans/ Mailing Address: 123 E San Carlos street, ste 391, San Jose, CA, 95112]. 
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. DMCA Notice</h2>
            <p>
              If you believe content on the Service infringes your copyright, send a notice containing:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Your name and contact details.</li>
              <li>Identification of the copyrighted work.</li>
              <li>Identification of the infringing material and its location.</li>
              <li>A statement of good-faith belief that the use is unauthorized.</li>
              <li>A statement under penalty of perjury that the notice is accurate and that you are authorized to act.</li>
              <li>Your physical or electronic signature.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Counter-Notification</h2>
            <p>
              If your content was removed and you believe it was removed by mistake or misidentification, you may submit a counter-notification with the information required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Repeat Infringers</h2>
            <p>
              We may suspend or terminate users who repeatedly infringe copyrights or repeatedly violate this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Takedown Procedure</h2>
            <p>
              When we receive a valid notice, we may remove or disable access to the content and may notify the user who posted it.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
