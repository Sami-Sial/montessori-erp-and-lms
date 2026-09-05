import Link from 'next/link';
import {
  GraduationCap, ClipboardCheck, BookOpen, DollarSign,
  Sparkles, Wifi, ArrowRight, CheckCircle2, Star,
  Users, Shield, Package
} from 'lucide-react';

/* ── Data ──────────────────────────────────────────────────────────────────── */

const FEATURES = [
  { icon: ClipboardCheck, color: '#5C7A5A', bg: '#F0F5F0', title: 'Smart Attendance',    desc: 'QR scan check-in, bulk classroom marking, auto parent notifications, and chronic-absence analytics — all in one tap.' },
  { icon: BookOpen,       color: '#3E4C8C', bg: '#EEEFFE', title: 'Curriculum Builder',  desc: 'Five Montessori areas, age-banded milestones, lesson plans linked to materials. Designed around how guides actually teach.' },
  { icon: GraduationCap, color: '#C17E20', bg: '#FDF3E3', title: 'Observation Tracking', desc: 'Log in 30 seconds. Photo upload with AI area suggestion. Per-student progress timelines across all five areas.' },
  { icon: DollarSign,    color: '#4B8B6F', bg: '#EBF5F0', title: 'Finance & Fees',       desc: 'Invoice generation, payment recording, overdue alerts, and a full general ledger — automated at every step.' },
  { icon: Sparkles,      color: '#3E6FA8', bg: '#EAF1FB', title: 'AI Insights',          desc: 'Nightly written insights on attendance patterns, curriculum gaps, and fee risk — specific and actionable, not just numbers.' },
  { icon: Wifi,          color: '#C1694F', bg: '#FAEEEB', title: 'Works Offline',        desc: 'Full PWA. Mark attendance and log observations on a tablet without internet. Syncs automatically on reconnect.' },
  { icon: Users,         color: '#52607A', bg: '#EEF0F4', title: 'HR & Staff',           desc: 'Employee records, payroll processing, leave request workflows, timesheets — the full HR cycle in one place.' },
  { icon: Package,       color: '#7B5EA7', bg: '#F3EEF9', title: 'Inventory',            desc: 'Track Montessori materials from catalog to classroom shelf. Low-stock alerts before you run out.' },
  { icon: Shield,        color: '#2A7A6A', bg: '#E8F5F2', title: 'Multi-tenant Security', desc: 'Each school is completely isolated. Role-based access control with granular permissions, customisable per school.' },
];

const STATS = [
  { value: '10',   label: 'User roles',          sub: 'Each with their own dashboard' },
  { value: '5',    label: 'Curriculum areas',     sub: 'Authentic Montessori structure' },
  { value: '100%', label: 'Offline capable',      sub: 'Works on tablets without WiFi' },
  { value: '1',    label: 'Platform',             sub: 'Replaces all your separate tools' },
];

const ROLES = [
  { title: 'Principals', icon: '🏫', color: 'from-[#3E4C8C] to-[#5560A8]', points: ['School-wide dashboard & KPIs', 'All-branch visibility', 'AI insight feed', 'Staff & payroll management'] },
  { title: 'Teachers',   icon: '📚', color: 'from-[#5C7A5A] to-[#7A9E78]', points: ['Tablet-first bulk attendance', 'Observation logging with photos', 'Lesson plan builder', 'AI drafting assistant'] },
  { title: 'Parents',    icon: '👨‍👩‍👧', color: 'from-[#C17E20] to-[#E3A83D]', points: ['Daily AI "Day in Review"', 'Live check-in notifications', 'Curriculum progress view', 'Direct teacher messaging'] },
];

const TESTIMONIALS = [
  { quote: "Finally a platform that actually understands Montessori. The curriculum area structure and observation workflow are exactly how we think.", name: 'Sarah K.', role: 'Lead Guide, Primary 3–6', initial: 'S' },
  { quote: "The AI insight flagged our Sensorial gap before we noticed it. Not just numbers — actual written advice with action items.", name: 'Marcus C.', role: 'Branch Administrator', initial: 'M' },
  { quote: "I mark attendance for 20 children in under two minutes on my tablet, even when the WiFi is down.", name: 'Diana P.', role: 'Montessori Principal', initial: 'D' },
];

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function HomePageContent() {
  return (
    <div className="overflow-hidden">

      {/* ══════════════════════════════════════
          HERO  — matches contact & about style
      ══════════════════════════════════════ */}
      <section className="py-24 bg-[#0D1117] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#3E4C8C] opacity-20 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-[#5C7A5A] opacity-10 blur-[70px]" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/8 text-white/70 text-xs font-bold uppercase tracking-widest mb-6">
            AI-powered · Offline-first · Multi-tenant
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-6xl font-black mb-5 leading-tight">
            The ERP & LMS built{' '}
            <span className="bg-gradient-to-r from-[#6672AD] to-[#A8B4F0] bg-clip-text text-transparent">
              for Montessori schools.
            </span>
          </h1>

          <p className="text-xl text-white/60 leading-relaxed mb-10 max-w-2xl mx-auto">
            Manage <strong className="text-white/90">students, curriculum, attendance, finances, staff,</strong> and
            parent communication — all in one platform that speaks the Montessori language.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#3E4C8C] to-[#5560A8] text-white font-bold text-base hover:from-[#4A59A8] hover:to-[#6672C0] transition-all shadow-xl shadow-[#3E4C8C]/40 hover:scale-[1.02]">
              Get started
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/20 bg-white/8 text-white font-semibold text-base hover:bg-white/15 hover:border-white/35 transition-all">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS BAR  — school-friendly only
      ══════════════════════════════════════ */}
      <section className="py-14 bg-white border-b border-[#E2DFD8]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, sub }) => (
              <div key={label} className="text-center">
                <p className="font-display text-5xl font-black text-[#3E4C8C] mb-1">{value}</p>
                <p className="text-sm font-bold text-[#1F2430]">{label}</p>
                <p className="text-xs text-[#5B5F6B] mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════ */}
      <section className="py-28 bg-[#F8F7F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3E4C8C]/10 text-[#3E4C8C] text-xs font-bold uppercase tracking-widest mb-5">
              Complete feature set
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-black text-[#1F2430] mb-5">
              Every tool your school needs,<br />
              <span className="text-[#3E4C8C]">in one platform.</span>
            </h2>
            <p className="text-lg text-[#5B5F6B] max-w-2xl mx-auto">
              Purpose-built for the five Montessori curriculum areas and the real daily workflow of a Montessori school.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title}
                className="group relative bg-white rounded-2xl border border-[#E2DFD8] p-7 hover:shadow-xl hover:border-transparent hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${bg}99 0%, transparent 60%)` }} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300"
                    style={{ backgroundColor: bg }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <h3 className="font-display font-bold text-[#1F2430] text-lg mb-2">{title}</h3>
                  <p className="text-[#5B5F6B] text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/features"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3E4C8C] text-white font-semibold text-sm hover:bg-[#2E3A6E] transition-colors shadow-md shadow-[#3E4C8C]/20">
              Explore all features <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ROLE SHOWCASE
      ══════════════════════════════════════ */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5C7A5A]/10 text-[#5C7A5A] text-xs font-bold uppercase tracking-widest mb-5">
              Role-based experience
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-black text-[#1F2430] mb-5">
              A different dashboard<br />
              <span className="text-[#5C7A5A]">for every role.</span>
            </h2>
            <p className="text-lg text-[#5B5F6B] max-w-2xl mx-auto">
              Not one admin panel with things hidden — each role gets its own layout, navigation, and focus area.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ROLES.map(({ title, icon, color, points }) => (
              <div key={title}
                className="relative rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className={`bg-gradient-to-br ${color} p-8 pb-6`}>
                  <div className="text-5xl mb-3">{icon}</div>
                  <h3 className="font-display font-black text-2xl text-white">{title}</h3>
                </div>
                <div className="bg-white border border-[#E2DFD8] border-t-0 rounded-b-2xl p-6 space-y-3">
                  {points.map((p) => (
                    <div key={p} className="flex items-center gap-2.5 text-sm text-[#1F2430]">
                      <CheckCircle2 size={15} className="text-[#4B8B6F] shrink-0" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          AI SECTION
      ══════════════════════════════════════ */}
      <section className="py-28 bg-[#0D1117] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#3E4C8C] opacity-20 blur-[90px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#5C7A5A] opacity-10 blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/8 text-white/60 text-xs font-bold uppercase tracking-widest mb-6">
                <Sparkles size={12} />
                Powered by xAI Grok
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-black mb-6 leading-tight">
                AI grounded in{' '}
                <span className="bg-gradient-to-r from-[#6672AD] to-[#A8B4F0] bg-clip-text text-transparent">
                  your real data.
                </span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-10">
                Every AI response is backed by actual student records, attendance history, and fee status —
                not generic text generation. The assistant knows your school.
              </p>
              <div className="space-y-4 mb-10">
                {[
                  { label: 'Nightly insight reports',    desc: 'Attendance patterns, curriculum gaps, fee delinquency risk' },
                  { label: 'Photo observation tagging',   desc: 'Upload a photo → AI suggests curriculum area + milestone' },
                  { label: '"Day in Review" for parents', desc: 'Personal daily digest written by AI from that day\'s real data' },
                  { label: 'Role-aware assistant',        desc: 'Different context and tools for teacher, parent, and admin' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#3E4C8C]/40 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={14} className="text-[#6672AD]" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{label}</p>
                      <p className="text-white/50 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/features#ai"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#1F2430] font-bold text-sm hover:bg-[#F5F4F1] transition-colors">
                See AI features <ArrowRight size={15} />
              </Link>
            </div>

            {/* Chat mockup */}
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-[#13161E]">
              <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#3E4C8C] to-[#5560A8]">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">AI Assistant</p>
                  <p className="text-xs text-white/60">Powered by xAI Grok</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                  <span className="text-xs text-white/50">Online</span>
                </div>
              </div>
              <div className="p-5 space-y-4 min-h-[280px]">
                <div className="flex justify-end">
                  <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-br-md bg-[#3E4C8C] text-white text-sm">
                    How is Alex doing this month?
                  </div>
                </div>
                <div className="flex justify-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#3E4C8C]/30 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles size={12} className="text-[#6672AD]" />
                  </div>
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-md bg-[#1E2130] text-white/90 text-sm leading-relaxed border border-white/8">
                    Alex has had a strong month! ✅ He <strong>mastered</strong> the Practical Life
                    pouring exercise and is practicing sandpaper letters. Attendance is at{' '}
                    <strong>94.7%</strong> — one late arrival on Tuesday. Sensorial shows the most
                    growth this term. 🌟
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-br-md bg-[#3E4C8C] text-white text-sm">
                    Any overdue fees?
                  </div>
                </div>
                <div className="flex justify-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#3E4C8C]/30 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles size={12} className="text-[#6672AD]" />
                  </div>
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-md bg-[#1E2130] text-white/90 text-sm leading-relaxed border border-white/8">
                    All invoices for Alex are{' '}
                    <strong className="text-[#4ADE80]">fully paid</strong>.
                    Next invoice is due December 1st.
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-white/8 flex gap-2">
                <div className="flex-1 px-4 py-2.5 rounded-xl bg-white/8 border border-white/10 text-white/30 text-sm">
                  Ask anything about your school…
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#3E4C8C] flex items-center justify-center">
                  <ArrowRight size={16} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section className="py-28 bg-[#F8F7F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E3A83D]/15 text-[#C17E20] text-xs font-bold uppercase tracking-widest mb-5">
              Testimonials
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-black text-[#1F2430]">
              Loved by Montessori educators.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, initial }) => (
              <div key={name}
                className="bg-white rounded-2xl border border-[#E2DFD8] p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-0.5 mb-6">
                  {[1,2,3,4,5].map(n => <Star key={n} size={16} className="fill-[#E3A83D] text-[#E3A83D]" />)}
                </div>
                <p className="text-[#1F2430] text-base leading-relaxed mb-8 font-medium">"{quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E2DFD8]">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#3E4C8C] to-[#5560A8] flex items-center justify-center text-white font-black text-base">
                    {initial}
                  </div>
                  <div>
                    <p className="font-bold text-[#1F2430] text-sm">{name}</p>
                    <p className="text-[#5B5F6B] text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════ */}
      <section className="py-28 bg-gradient-to-br from-[#3E4C8C] via-[#4A59A8] to-[#2E3A6E] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-8">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black mb-6 leading-tight">
            Transform how your school operates.
          </h2>
          <p className="text-white/70 text-xl mb-10 leading-relaxed">
            Set up your school in under 5 minutes.
            Contact us with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-[#3E4C8C] font-black text-base hover:bg-[#F0F1FF] transition-all shadow-2xl shadow-black/20 hover:scale-[1.02]">
              Get started now
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/30 text-white font-bold text-base hover:bg-white/10 hover:border-white/50 transition-all">
              Contact us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
