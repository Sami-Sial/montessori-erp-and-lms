import Link from 'next/link';

const LAST_UPDATED = 'August 28, 2026';

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-display text-2xl font-bold text-[#1F2430] mb-4">{title}</h2>
      <div className="space-y-3 text-[#5B5F6B] leading-relaxed text-sm">{children}</div>
    </section>
  );
}

const TOC = [
  { id: 'acceptance',   label: 'Acceptance of terms' },
  { id: 'description',  label: 'Service description' },
  { id: 'accounts',     label: 'Accounts & organisations' },
  { id: 'acceptable',   label: 'Acceptable use' },
  { id: 'data',         label: 'Your data' },
  { id: 'payment',      label: 'Payment & billing' },
  { id: 'ip',           label: 'Intellectual property' },
  { id: 'liability',    label: 'Limitation of liability' },
  { id: 'termination',  label: 'Termination' },
  { id: 'governing',    label: 'Governing law' },
  { id: 'contact-us',   label: 'Contact' },
];

export default function TermsPage() {
  return (
    <div className="bg-white">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0D1117] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#3E4C8C] opacity-20 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-[#5C7A5A] opacity-10 blur-[70px]" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/8 text-white/70 text-xs font-bold uppercase tracking-widest mb-6">
            Legal
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black mb-5 leading-tight">
            Terms of Service
          </h1>
          <p className="text-xl text-white/60 leading-relaxed">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-12">

          {/* Sticky TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold text-[#5B5F6B] uppercase tracking-wider mb-4">On this page</p>
              <nav className="space-y-1">
                {TOC.map(({ id, label }) => (
                  <a key={id} href={`#${id}`}
                    className="block text-sm text-[#5B5F6B] hover:text-[#3E4C8C] py-1 transition-colors">
                    {label}
                  </a>
                ))}
              </nav>
              <div className="mt-8 p-4 rounded-xl bg-[#F5F4F1] border border-[#E2DFD8]">
                <p className="text-xs text-[#5B5F6B]">
                  Questions? Email{' '}
                  <a href="mailto:samisial1555@gmail.com" className="text-[#3E4C8C] hover:underline">
                    samisial1555@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-12">

            <Section id="acceptance" title="1. Acceptance of terms">
              <p>
                By accessing or using Montessori Platform ("the Service"), you agree to be bound
                by these Terms of Service ("Terms"). If you are using the Service on behalf of a
                school or organisation, you represent that you have authority to bind that
                organisation to these Terms.
              </p>
              <p>
                If you do not agree to these Terms, you may not use the Service. We may update
                these Terms from time to time. We will notify you of material changes by email
                at least 30 days before they take effect. Continued use after the effective date
                constitutes acceptance of the revised Terms.
              </p>
            </Section>

            <Section id="description" title="2. Service description">
              <p>
                Montessori Platform provides a cloud-based ERP and learning management system
                designed for Montessori schools. The Service includes tools for student management,
                attendance tracking, curriculum planning, observation logging, financial management,
                HR, inventory, parent communication, and AI-powered insights.
              </p>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Service
                at any time. We will provide reasonable notice of significant changes.
              </p>
            </Section>

            <Section id="accounts" title="3. Accounts & organisations">
              <p>
                Each school or franchise registers as an Organisation on the platform. The first
                administrator account ("Org Admin") is responsible for:
              </p>
              <ul className="space-y-1.5">
                {[
                  'Maintaining the accuracy of their organisation\'s data',
                  'Managing user accounts within their organisation',
                  'Ensuring that all users comply with these Terms',
                  'Obtaining necessary consents from parents and guardians for student data entry',
                  'Keeping login credentials secure and not sharing them',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3E4C8C] mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                You must be at least 18 years old to create an account. Student accounts (STUDENT
                role) may be created for users under 18 by authorised school administrators only.
              </p>
              <p>
                You are responsible for all activities that occur under your account. Notify us
                immediately at samisial1555@gmail.com if you suspect unauthorised access.
              </p>
            </Section>

            <Section id="acceptable" title="4. Acceptable use">
              <p>You agree not to:</p>
              <ul className="space-y-1.5">
                {[
                  'Use the Service for any unlawful purpose or in violation of applicable laws',
                  'Upload malicious code, viruses, or any software designed to harm the Service or its users',
                  'Attempt to gain unauthorised access to other organisations\' data (the multi-tenant isolation is a security control — circumventing it is a violation of these Terms and applicable computer fraud laws)',
                  'Scrape, harvest, or systematically extract data from the Service',
                  'Impersonate any person or entity',
                  'Use the AI assistant to generate content that violates applicable laws or our content policies',
                  'Resell or sublicense access to the Service without express written consent',
                  'Use the Service in a way that places unreasonable load on our infrastructure',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B24C3E] mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="data" title="5. Your data">
              <p>
                You retain ownership of all data you input into the Service ("Customer Data").
                By using the Service, you grant us a limited licence to host, process, and
                transmit your Customer Data solely as necessary to provide the Service.
              </p>
              <p>
                We act as a data processor for Customer Data. Our data processing practices are
                described in our <Link href="/privacy" className="text-[#3E4C8C] hover:underline">Privacy Policy</Link>.
                Schools are the data controllers for student and staff data.
              </p>
              <p>
                You are responsible for ensuring you have lawful basis to process any personal
                data you enter into the platform, including obtaining consent from parents or
                guardians where required.
              </p>
              <p>
                Upon termination of your account, we will provide a data export on request within
                30 days. All Customer Data is permanently deleted 30 days after account termination.
              </p>
            </Section>

            <Section id="payment" title="6. Payment & billing">
              <p>
                Paid plans are billed monthly or annually in advance. All fees are stated in USD
                and exclude applicable taxes, which are your responsibility.
              </p>
              <p>
                We offer a 14-day free trial with full access to the selected plan. No credit
                card is required to start a trial. At the end of the trial, you must subscribe
                to continue using the Service.
              </p>
              <p>
                Subscriptions renew automatically unless cancelled at least 24 hours before the
                renewal date. You can cancel at any time from your account settings. We do not
                provide refunds for partial billing periods, except where required by law.
              </p>
              <p>
                We reserve the right to change pricing with 30 days' written notice to existing
                subscribers. Price changes take effect at your next renewal date.
              </p>
            </Section>

            <Section id="ip" title="7. Intellectual property">
              <p>
                The Montessori Platform software, design, trademarks, and documentation are owned
                by us or our licensors. These Terms do not grant you any right to use our
                trademarks, logos, or brand features.
              </p>
              <p>
                You retain all rights to your Customer Data. We do not claim ownership of any
                content you upload or create using the Service.
              </p>
              <p>
                Feedback or suggestions you provide about the Service may be used by us to improve
                the Service without compensation or attribution to you.
              </p>
            </Section>

            <Section id="liability" title="8. Limitation of liability">
              <p>
                The Service is provided "as is" without warranties of any kind, express or implied.
                We do not warrant that the Service will be uninterrupted, error-free, or that
                defects will be corrected.
              </p>
              <p>
                To the maximum extent permitted by law, our total liability to you for any claims
                arising from or related to the Service is limited to the greater of (a) the amount
                you paid us in the 12 months prior to the claim, or (b) $100 USD.
              </p>
              <p>
                We are not liable for indirect, incidental, special, consequential, or punitive
                damages, including loss of data, revenue, or profits, even if we have been advised
                of the possibility of such damages.
              </p>
              <p>
                Some jurisdictions do not allow the exclusion of certain warranties or limitation
                of certain damages. In such jurisdictions, our liability is limited to the greatest
                extent permitted by law.
              </p>
            </Section>

            <Section id="termination" title="9. Termination">
              <p>
                You may terminate your account at any time by contacting us or using the account
                deletion feature in your settings.
              </p>
              <p>
                We may suspend or terminate your access to the Service immediately, without
                prior notice, if you materially breach these Terms, including but not limited
                to: non-payment of fees, violation of the acceptable use policy, or actions that
                could harm other users or the Service.
              </p>
              <p>
                Upon termination, your right to use the Service ceases immediately. Sections
                5 (Your data), 7 (Intellectual property), 8 (Limitation of liability), and
                10 (Governing law) survive termination.
              </p>
            </Section>

            <Section id="governing" title="10. Governing law">
              <p>
                These Terms are governed by the laws of the State of Texas, USA, without regard
                to its conflict of law provisions. You agree to submit to the exclusive jurisdiction
                of the state and federal courts located in Travis County, Texas.
              </p>
              <p>
                For users in the European Union, nothing in these Terms affects your rights under
                applicable EU consumer protection laws.
              </p>
            </Section>

            <Section id="contact-us" title="11. Contact">
              <p>For legal enquiries:</p>
              <div className="rounded-xl border border-[#E2DFD8] p-5 space-y-1.5">
                <p className="font-semibold text-[#1F2430] text-sm">Montessori Platform — Legal</p>
                <p className="text-sm">📧 <a href="mailto:samisial1555@gmail.com" className="text-[#3E4C8C] hover:underline">samisial1555@gmail.com</a></p>
                <p className="text-sm">📍 Pakistan · +92 314 6180920</p>
              </div>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
}
