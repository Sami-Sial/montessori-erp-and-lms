import Link from 'next/link';
import {
  ClipboardCheck, BookOpen, GraduationCap, DollarSign, Users,
  Package, Megaphone, Award, Sparkles, Wifi, Shield,
  BarChart2, QrCode, Camera, FileText, Bell, ArrowRight, CheckCircle2
} from 'lucide-react';

const SECTIONS = [
  {
    id: 'attendance', tag: 'Attendance', icon: ClipboardCheck,
    gradient: 'from-[#5C7A5A] to-[#7A9E78]', light: 'bg-[#F0F5F0] text-[#5C7A5A]',
    title: 'Smart attendance for tablet-first classrooms',
    desc: 'Mark 20 students in under 2 minutes, online or offline. Auto late-flagging, QR scan, parent notifications — built for how teachers actually work.',
    features: [
      { icon: ClipboardCheck, label: 'Bulk classroom marking',    sub: 'One screen, all students, large touch targets for tablets' },
      { icon: QrCode,         label: 'QR scan check-in',         sub: 'Contactless, instant, auto-flags arrivals after 8:30 AM as late' },
      { icon: Wifi,           label: 'Works offline',            sub: 'Queue locally, auto-sync on reconnect with conflict resolution' },
      { icon: Bell,           label: 'Parent notifications',     sub: 'Auto email/SMS on check-in and check-out via BullMQ' },
      { icon: BarChart2,      label: 'Chronic-absence analytics',sub: 'Monthly trend charts, < 80% threshold flags, per-student history' },
    ],
  },
  {
    id: 'curriculum', tag: 'Curriculum', icon: BookOpen,
    gradient: 'from-[#3E4C8C] to-[#5560A8]', light: 'bg-[#EEEFFE] text-[#3E4C8C]',
    title: 'Authentic Montessori curriculum management',
    desc: 'Five areas, age-banded milestones, lesson plans linked to materials and objectives. Not a generic LMS reskinned — built around how guides actually plan.',
    features: [
      { icon: BookOpen,       label: 'Five curriculum areas',    sub: 'Practical Life, Sensorial, Language, Mathematics, Culture' },
      { icon: GraduationCap,  label: 'Milestone library',        sub: 'Age-banded milestones per area, customisable per school' },
      { icon: FileText,       label: 'Lesson plan builder',      sub: 'Link materials, objectives, age band, scheduled date' },
      { icon: Package,        label: 'Material catalog',         sub: 'Pink Tower, Sandpaper Letters, Golden Beads, and more' },
    ],
  },
  {
    id: 'observations', tag: 'Observations', icon: GraduationCap,
    gradient: 'from-[#C17E20] to-[#E3A83D]', light: 'bg-[#FDF3E3] text-[#C17E20]',
    title: 'Observation logging that takes 30 seconds',
    desc: 'Tap student → select area → mastery level → type note. Photo upload with AI-powered curriculum area suggestion pre-fills the form.',
    features: [
      { icon: GraduationCap, label: 'Five mastery levels',       sub: 'Not Introduced → Introduced → Practicing → Mastered → Extending' },
      { icon: Camera,        label: 'Photo with AI tagging',     sub: 'Grok Vision analyses the photo and pre-fills area + milestone' },
      { icon: BarChart2,     label: 'Per-student progress',      sub: 'Progress bars per area, full observation timeline with photos' },
      { icon: FileText,      label: 'Conference report export',  sub: 'PDF with observations, progress, attendance, and fee status' },
    ],
  },
  {
    id: 'finance', tag: 'Finance', icon: DollarSign,
    gradient: 'from-[#4B8B6F] to-[#6AAF8E]', light: 'bg-[#EBF5F0] text-[#4B8B6F]',
    title: 'Complete school finance — automated end to end',
    desc: 'From fee structure setup to overdue AI alerts. Every payment creates a ledger entry. Monospace numbers in every table.',
    features: [
      { icon: FileText,   label: 'Auto-numbered invoices',       sub: 'Multiple line items, issued to students, sent by email' },
      { icon: DollarSign, label: 'Payment recording',            sub: 'Invoice status auto-updates: Draft → Sent → Paid' },
      { icon: Bell,       label: 'AI overdue alerts',            sub: 'Nightly job flags overdue invoices with recommended actions' },
      { icon: BarChart2,  label: 'General ledger',               sub: 'Double-entry ledger record on every transaction' },
      { icon: FileText,   label: 'Expense tracking',             sub: 'Categorised with receipt upload to Cloudinary' },
    ],
  },
  {
    id: 'hr', tag: 'HR & Staff', icon: Users,
    gradient: 'from-[#52607A] to-[#6E7D9A]', light: 'bg-[#EEF0F4] text-[#52607A]',
    title: 'Staff management that stays out of your way',
    desc: 'Employee records, leave workflows, payroll, and timesheets. Managers approve in one tap.',
    features: [
      { icon: Users,     label: 'Staff profiles',                sub: 'Qualifications, certifications, employment type, salary' },
      { icon: FileText,  label: 'Leave request workflow',        sub: 'Submit → Approve/Reject with rejection reason, audit trail' },
      { icon: DollarSign,label: 'Payroll processing',            sub: 'Base + allowances + deductions, net pay per month per staff' },
      { icon: ClipboardCheck, label: 'Timesheets',              sub: 'Weekly submission with per-day hours and activity notes' },
    ],
  },
  {
    id: 'inventory', tag: 'Inventory', icon: Package,
    gradient: 'from-[#7B5EA7] to-[#9B7EC7]', light: 'bg-[#F3EEF9] text-[#7B5EA7]',
    title: 'Know where every Montessori material is',
    desc: 'Track apparatus from catalog through purchase orders to classroom shelves. Low-stock alerts before you run out.',
    features: [
      { icon: Package,    label: 'Classroom material tracker',   sub: 'In-use vs. storage, replacement due dates per item' },
      { icon: Bell,       label: 'Low-stock alerts',             sub: 'Configurable minimum stock threshold, notification on breach' },
      { icon: FileText,   label: 'Purchase orders',              sub: 'Create, submit, receive — auto-increments stock on receive' },
      { icon: BarChart2,  label: 'Stock movements',              sub: 'Every change logged: purchase, usage, return, disposal' },
    ],
  },
  {
    id: 'ai', tag: 'AI Features', icon: Sparkles,
    gradient: 'from-[#3E6FA8] to-[#5A8EC8]', light: 'bg-[#EAF1FB] text-[#3E6FA8]',
    title: 'AI grounded in your real school data',
    desc: 'Not a generic chatbot — every response is backed by actual student records via Grok function-calling tools.',
    features: [
      { icon: Sparkles,  label: 'Role-aware AI assistant',       sub: 'Teacher, parent, admin each get different context and tools' },
      { icon: BarChart2, label: 'Nightly insight reports',       sub: 'Attendance, curriculum gaps, fee delinquency — in plain English' },
      { icon: Camera,    label: 'Photo observation tagging',     sub: 'Upload photo → Grok Vision suggests area + milestone' },
      { icon: FileText,  label: '"Day in Review" for parents',   sub: 'Personal daily digest written by AI from real data' },
      { icon: Shield,    label: 'API key never exposed',         sub: 'GROK_API_KEY lives only on the backend — never the client' },
    ],
  },
  {
    id: 'offline', tag: 'Offline PWA', icon: Wifi,
    gradient: 'from-[#2A7A6A] to-[#4A9A8A]', light: 'bg-[#E8F5F2] text-[#2A7A6A]',
    title: 'Works in the classroom, with or without WiFi',
    desc: 'Install it on a tablet like a native app. Mark attendance, log observations, review lesson plans — offline. Syncs on reconnect.',
    features: [
      { icon: Wifi,          label: 'IndexedDB caching',         sub: 'Roster, attendance, lesson plans stored locally in Dexie.js' },
      { icon: ClipboardCheck,label: 'Offline attendance',        sub: 'Full bulk marking + QR scan while disconnected' },
      { icon: GraduationCap, label: 'Conflict resolution UI',   sub: 'Side-by-side diff when two devices edited the same record' },
      { icon: Bell,          label: 'Sync status indicator',     sub: 'Persistent: Synced / Pending / Syncing / Conflict / Offline' },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div>
      {/* Header */}
      <section className="py-24 bg-[#0D1117] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#3E4C8C] opacity-20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#5C7A5A] opacity-10 blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/8 text-white/70 text-xs font-bold uppercase tracking-widest mb-6">
            Complete feature set
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black mb-6 leading-tight">
            Every feature your<br />
            <span className="bg-gradient-to-r from-[#6672AD] to-[#A8B4F0] bg-clip-text text-transparent">
              Montessori school needs.
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Purpose-built for the five Montessori areas and the real daily workflow
            of a Montessori school — not a generic SaaS tool.
          </p>
        </div>
      </section>

      {/* Feature sections */}
      {SECTIONS.map(({ id, tag, icon: Icon, gradient, light, title, desc, features }, i) => (
        <section key={id} id={id} className={`py-24 ${i % 2 === 0 ? 'bg-white' : 'bg-[#F8F7F5]'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid lg:grid-cols-2 gap-16 items-start ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>

              <div className={i % 2 !== 0 ? 'lg:order-2' : ''}>
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 ${light}`}>
                  <Icon size={12} /> {tag}
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-black text-[#1F2430] mb-5 leading-tight">{title}</h2>
                <p className="text-[#5B5F6B] text-lg leading-relaxed mb-8">{desc}</p>
                <Link href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#3E4C8C] to-[#5560A8] text-white font-bold text-sm hover:from-[#4A59A8] hover:to-[#6672C0] transition-all shadow-md shadow-[#3E4C8C]/20 hover:scale-[1.02]">
                  Get started <ArrowRight size={15} />
                </Link>
              </div>

              <div className={i % 2 !== 0 ? 'lg:order-1' : ''}>
                <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-1 shadow-xl`}>
                  <div className="bg-white rounded-xl p-5 space-y-3">
                    {features.map(({ icon: FIcon, label, sub }) => (
                      <div key={label}
                        className="flex items-start gap-4 p-4 rounded-xl border border-[#F0EEE8] hover:border-[#E2DFD8] hover:bg-[#F8F7F5] transition-colors">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${light}`}>
                          <FIcon size={17} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[#1F2430] text-sm">{label}</p>
                          <p className="text-[#5B5F6B] text-xs mt-0.5 leading-relaxed">{sub}</p>
                        </div>
                        <CheckCircle2 size={15} className="text-[#4B8B6F] shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-[#3E4C8C] via-[#4A59A8] to-[#2E3A6E] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-4xl md:text-5xl font-black mb-4">Ready to get started?</h2>
          <p className="text-white/70 mb-8 text-lg">Contact us with any questions.</p>
          <Link href="/register"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-[#3E4C8C] font-black text-base hover:bg-[#F0F1FF] transition-all shadow-xl shadow-black/20 hover:scale-[1.02]">
            Get started <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
