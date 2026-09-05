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
  { id: 'overview',     label: 'Overview' },
  { id: 'data',         label: 'Data we collect' },
  { id: 'use',          label: 'How we use data' },
  { id: 'sharing',      label: 'Data sharing' },
  { id: 'retention',    label: 'Retention & deletion' },
  { id: 'security',     label: 'Security' },
  { id: 'cookies',      label: 'Cookies' },
  { id: 'children',     label: "Children's privacy" },
  { id: 'gdpr',         label: 'GDPR & your rights' },
  { id: 'contact-us',   label: 'Contact us' },
];

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-xl text-white/60 leading-relaxed">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-12">

          {/* Table of contents — sticky on desktop */}
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
              <div className="mt-8 p-4 rounded-xl bg-[#3E4C8C]/5 border border-[#3E4C8C]/20">
                <p className="text-xs font-semibold text-[#3E4C8C] mb-1">Questions?</p>
                <p className="text-xs text-[#5B5F6B]">Email us at{' '}
                  <a href="mailto:samisial1555@gmail.com" className="text-[#3E4C8C] hover:underline">
                    samisial1555@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-12">

            <Section id="overview" title="Overview">
              <p>
                Montessori Platform ("we", "our", or "us") operates a multi-tenant school ERP and
                learning management system. This Privacy Policy explains how we collect, use, store,
                and protect information from users of our platform, including school administrators,
                teachers, parents, and students.
              </p>
              <p>
                We take the privacy of children and families extremely seriously. We are committed
                to full compliance with GDPR (EU), COPPA (US), FERPA (US), and applicable data
                protection laws in all jurisdictions we operate in.
              </p>
              <p>
                By using our platform, you agree to the collection and use of information in
                accordance with this policy. Schools (organisations) are the data controllers for
                their students' and staff members' data. Montessori Platform acts as a data processor
                on their behalf.
              </p>
            </Section>

            <Section id="data" title="Data we collect">
              <p>We collect the following categories of data:</p>

              <div className="space-y-4">
                {[
                  {
                    title: 'Account data',
                    items: ['Name, email address, phone number', 'Encrypted password (argon2id hash — we never store plaintext passwords)', 'Role and permission assignments', 'Login timestamps and IP addresses (for security audit logs)'],
                  },
                  {
                    title: 'Student data',
                    items: ['Student name, date of birth, gender, nationality', 'Guardian contact information', 'Medical information (allergies, conditions, medications) — stored with restricted access', 'Enrollment and classroom history', 'QR code identifier for attendance', 'Photo (if uploaded — stored on Cloudinary)'],
                  },
                  {
                    title: 'Academic data',
                    items: ['Attendance records with timestamps', 'Teacher observations and mastery assessments', 'Curriculum progress by milestone', 'Lesson plans and materials'],
                  },
                  {
                    title: 'Financial data',
                    items: ['Invoice amounts and payment records', 'Fee structures', 'Expense records', 'We do not store full payment card details — card processing is handled by third-party PCI-compliant providers'],
                  },
                  {
                    title: 'Usage data',
                    items: ['Pages visited, features used (anonymised analytics)', 'Browser type, operating system, device type', 'Error logs and performance metrics'],
                  },
                ].map(({ title, items }) => (
                  <div key={title} className="rounded-xl border border-[#E2DFD8] p-4">
                    <p className="font-semibold text-[#1F2430] text-sm mb-2">{title}</p>
                    <ul className="space-y-1">
                      {items.map(item => (
                        <li key={item} className="flex items-start gap-2 text-xs">
                          <span className="w-1 h-1 rounded-full bg-[#3E4C8C] mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="use" title="How we use data">
              <p>We use the data we collect for the following purposes:</p>
              <ul className="space-y-2">
                {[
                  'Providing and operating the Montessori Platform service',
                  'Enabling school staff to manage students, attendance, curriculum, and finances',
                  'Sending transactional emails (attendance notifications, invoice alerts, password resets)',
                  'Generating AI-powered insights — data is sent to xAI Grok API and is subject to their data processing agreement',
                  'Improving and debugging the platform (anonymised usage analytics)',
                  'Complying with legal obligations and responding to lawful requests',
                  'Detecting and preventing fraud, abuse, and security incidents',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3E4C8C] mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                We do not use student data for advertising, we do not sell personal data to third
                parties, and we do not use student data to build commercial profiles.
              </p>
            </Section>

            <Section id="sharing" title="Data sharing">
              <p>We share data with the following categories of third parties only as necessary to operate the service:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-[#E2DFD8] rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-[#F5F4F1]">
                      {['Third party', 'Purpose', 'Data shared'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold text-[#1F2430]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DFD8]">
                    {[
                      ['Cloudinary', 'File storage (photos, documents)', 'File content, file metadata'],
                      ['xAI (Grok)', 'AI-powered insights & assistant', 'Anonymised school data for insight generation'],
                      ['Mailtrap / SMTP', 'Transactional email delivery', 'Recipient email address, message content'],
                      ['Railway / Render', 'Hosting infrastructure', 'All platform data (encrypted at rest)'],
                      ['Redis Labs', 'Queue and cache infrastructure', 'Session tokens, job payloads (no PII in queue)'],
                    ].map(([third, purpose, data]) => (
                      <tr key={third} className="hover:bg-[#F5F4F1]/50">
                        <td className="px-4 py-3 font-medium text-[#1F2430]">{third}</td>
                        <td className="px-4 py-3 text-[#5B5F6B]">{purpose}</td>
                        <td className="px-4 py-3 text-[#5B5F6B]">{data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                We require all third-party processors to maintain appropriate data protection
                standards and to process data only as instructed by us.
              </p>
            </Section>

            <Section id="retention" title="Retention & deletion">
              <p>
                We retain personal data for as long as your school account is active. When an
                organisation account is deleted, all associated data is purged within 30 days,
                including student records, attendance history, and financial records.
              </p>
              <p>
                Individual users (parents, staff) may request deletion of their personal account
                data by contacting us at <a href="mailto:samisial1555@gmail.com" className="text-[#3E4C8C] hover:underline">samisial1555@gmail.com</a>.
                Note that some data may be retained where required by law (e.g. financial records
                for tax compliance).
              </p>
              <p>
                Soft-deleted records (students, observations marked as deleted) are permanently
                purged after 90 days.
              </p>
            </Section>

            <Section id="security" title="Security">
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="space-y-1.5">
                {[
                  'All data encrypted in transit via TLS 1.3',
                  'Data encrypted at rest on all storage systems',
                  'Passwords hashed with argon2id — never stored in plaintext',
                  'Refresh tokens stored as argon2 hashes; replay attacks return 401',
                  'Multi-tenant isolation: every query is scoped to the organisation from the JWT',
                  'Role-based access control with 27 granular permission keys',
                  'Audit log of all sensitive actions (role changes, payment edits, data exports)',
                  'Rate limiting on all endpoints, stricter limits on authentication routes',
                  'Security headers (Helmet.js) on every API response',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4B8B6F] mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                If you discover a security vulnerability, please report it responsibly to{' '}
                <a href="mailto:samisial1555@gmail.com" className="text-[#3E4C8C] hover:underline">samisial1555@gmail.com</a>.
              </p>
            </Section>

            <Section id="cookies" title="Cookies">
              <p>
                We use a minimal set of cookies necessary to operate the service:
              </p>
              <div className="rounded-xl border border-[#E2DFD8] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#F5F4F1]">
                      {['Cookie', 'Purpose', 'Duration'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold text-[#1F2430]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DFD8]">
                    {[
                      ['refreshToken (localStorage)', 'Authentication session persistence', 'Until logout or 7 days'],
                      ['i18nextLng (localStorage)', 'Saved language preference', 'Persistent'],
                      ['theme (localStorage)', 'Saved dark/light mode preference', 'Persistent'],
                      ['lastSyncPull (localStorage)', 'Offline sync timestamp', 'Rolling, 24h'],
                    ].map(([name, purpose, dur]) => (
                      <tr key={name}>
                        <td className="px-4 py-3 font-mono text-[#3E4C8C]">{name}</td>
                        <td className="px-4 py-3 text-[#5B5F6B]">{purpose}</td>
                        <td className="px-4 py-3 text-[#5B5F6B]">{dur}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                We do not use advertising cookies or cross-site tracking cookies. We do not use
                Google Analytics or any similar third-party tracking service on the platform itself.
              </p>
            </Section>

            <Section id="children" title="Children's privacy">
              <p>
                We recognise the sensitivity of data relating to children under 13 (COPPA) and
                under 16 (GDPR). Student data is collected and processed solely on behalf of
                the school (data controller) for educational purposes.
              </p>
              <p>
                We do not collect student data directly — all student records are created and
                managed by school administrators. Schools are responsible for obtaining appropriate
                consent from parents or guardians before entering student data into the platform.
              </p>
              <p>
                Students under 13 do not have direct login access by default. The STUDENT role
                is age-gated and must be explicitly enabled by the school administrator.
              </p>
            </Section>

            <Section id="gdpr" title="GDPR & your rights">
              <p>
                If you are in the European Economic Area (EEA) or UK, you have the following
                rights under GDPR:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { right: 'Right of access', desc: 'Request a copy of your personal data' },
                  { right: 'Right to rectification', desc: 'Correct inaccurate data' },
                  { right: 'Right to erasure', desc: 'Request deletion ("right to be forgotten")' },
                  { right: 'Right to portability', desc: 'Receive your data in a structured format' },
                  { right: 'Right to restrict processing', desc: 'Limit how we use your data' },
                  { right: 'Right to object', desc: 'Object to processing based on legitimate interests' },
                ].map(({ right, desc }) => (
                  <div key={right} className="p-3 rounded-lg border border-[#E2DFD8] bg-[#F5F4F1]/50">
                    <p className="font-semibold text-[#1F2430] text-xs">{right}</p>
                    <p className="text-[#5B5F6B] text-xs mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
              <p>
                To exercise any of these rights, contact us at{' '}
                <a href="mailto:samisial1555@gmail.com" className="text-[#3E4C8C] hover:underline">samisial1555@gmail.com</a>.
                We will respond within 30 days. You also have the right to lodge a complaint with
                your local supervisory authority.
              </p>
            </Section>

            <Section id="contact-us" title="Contact us">
              <p>For any privacy-related questions or requests:</p>
              <div className="rounded-xl border border-[#E2DFD8] p-5 space-y-2">
                <p className="font-semibold text-[#1F2430] text-sm">Montessori Platform — Data Protection</p>
                <p className="text-sm">📧 <a href="mailto:samisial1555@gmail.com" className="text-[#3E4C8C] hover:underline">samisial1555@gmail.com</a></p>
                <p className="text-sm">📍 Pakistan · +92 314 6180920</p>
              </div>
              <p className="text-xs text-[#5B5F6B]">
                This policy may be updated periodically. We will notify active school administrators
                by email of any material changes at least 30 days before they take effect.
              </p>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
}
