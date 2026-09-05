import Link from 'next/link';
import {
  GraduationCap, BookOpen, DollarSign, Users,
  Sparkles, Wifi, Shield, ArrowRight, CheckCircle2, Layers
} from 'lucide-react';

const PILLARS = [
  {
    num: '01', icon: BookOpen, color: '#3E4C8C',
    title: 'Authentically Montessori',
    desc: 'Five curriculum areas, age-banded milestones, three-year cycles, and observation-based assessment — built around how guides actually teach, not adapted from a generic LMS.',
  },
  {
    num: '02', icon: Users, color: '#5C7A5A',
    title: 'Every role, their own experience',
    desc: 'Principals, teachers, parents, and students get genuinely different dashboards — different navigation, different layout, different focus. Not one screen with things hidden.',
  },
  {
    num: '03', icon: Sparkles, color: '#3E6FA8',
    title: 'AI that actually helps',
    desc: 'Nightly written insights on attendance patterns, curriculum gaps, and fee risk. An AI assistant that knows your actual students — not generic text generation.',
  },
  {
    num: '04', icon: Wifi, color: '#C1694F',
    title: 'Offline-first by design',
    desc: 'Tablet-first PWA. Teachers mark attendance and log observations without internet. Everything syncs automatically on reconnect with full conflict resolution.',
  },
  {
    num: '05', icon: Shield, color: '#4B8B6F',
    title: 'Secure & multi-tenant',
    desc: 'Every school is completely isolated from every other. Role-based access control with granular permissions — fully customisable per school without a code deploy.',
  },
  {
    num: '06', icon: DollarSign, color: '#7B5EA7',
    title: 'Full operations coverage',
    desc: 'Finance, HR, inventory, communication, gamification — the entire school operation in one platform, replacing the patchwork of disconnected tools most schools rely on.',
  },
];

const MODULES = [
  { cat: 'Students & Enrolment',  items: ['Full student profiles & multiple guardians', 'Medical info & emergency contacts', 'Enrolment history across academic years', 'QR code per student for contactless check-in'] },
  { cat: 'Attendance',            items: ['QR scan & bulk classroom marking', 'Auto parent notifications on check-in', 'Chronic-absence analytics & trends', 'Works fully offline on tablets'] },
  { cat: 'Curriculum',            items: ['Five Montessori curriculum areas', 'Age-banded milestone library', 'Lesson plan builder with materials', 'Observation logging with photo & AI tagging'] },
  { cat: 'Finance',               items: ['Invoice generation & payment recording', 'Overdue alerts with AI follow-up suggestions', 'Expense tracking & general ledger', 'Per-student fee status dashboard'] },
  { cat: 'HR & Inventory',        items: ['Staff records, payroll & leave workflow', 'Timesheets & staff attendance', 'Montessori material tracker', 'Low-stock alerts & purchase orders'] },
  { cat: 'Communication & More',  items: ['School-wide & classroom announcements', 'Direct teacher–parent messaging', 'Gamification — badges, points, leaderboards', 'Multi-language UI (English & Spanish)'] },
];

export default function AboutPage() {
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
            About the platform
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black mb-5 leading-tight">
            The complete ERP & LMS{' '}
            <span className="bg-gradient-to-r from-[#6672AD] to-[#A8B4F0] bg-clip-text text-transparent">
              for Montessori schools.
            </span>
          </h1>
          <p className="text-xl text-white/60 leading-relaxed">
            One platform for students, curriculum, attendance, finance, staff, and parent communication —
            built specifically for the way Montessori schools operate.
          </p>
        </div>
      </section>

      {/* ── WHAT IT COVERS ────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3E4C8C]/10 text-[#3E4C8C] text-xs font-bold uppercase tracking-widest mb-5">
              <Layers size={12} /> What it covers
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-black text-[#1F2430] mb-4">
              One platform. Every module.
            </h2>
            <p className="text-[#5B5F6B] text-lg max-w-2xl mx-auto">
              Replaces the patchwork of spreadsheets, separate apps, and disconnected tools
              that most schools piece together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map(({ cat, items }) => (
              <div key={cat}
                className="rounded-2xl border border-[#E2DFD8] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="px-6 py-4 bg-gradient-to-r from-[#3E4C8C] to-[#5560A8]">
                  <p className="font-black text-white text-sm uppercase tracking-widest">{cat}</p>
                </div>
                <div className="p-6 bg-[#F8F7F5] space-y-3">
                  {items.map(item => (
                    <div key={item} className="flex items-start gap-3 text-sm text-[#1F2430]">
                      <CheckCircle2 size={15} className="text-[#4B8B6F] shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIX PRINCIPLES ────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0D1117] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#3E4C8C] opacity-15 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#5C7A5A] opacity-10 blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/8 text-white/60 text-xs font-bold uppercase tracking-widest mb-5">
              Our approach
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
              Built on six commitments.
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Every design decision comes back to these.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PILLARS.map(({ num, icon: Icon, color, title, desc }) => (
              <div key={title}
                className="relative rounded-2xl border border-white/8 bg-white/5 p-8 hover:bg-white/8 hover:border-white/15 transition-all duration-300 overflow-hidden group">
                {/* Watermark number */}
                <div className="absolute top-4 right-6 font-display font-black text-7xl text-white/[0.04] select-none leading-none">
                  {num}
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${color}25` }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <h3 className="font-display font-black text-white text-lg mb-3">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-[#3E4C8C] via-[#4A59A8] to-[#2E3A6E] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-white opacity-5 blur-[80px] pointer-events-none" />

        <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-8">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            See it in action.
          </h2>
          <p className="text-white/65 text-xl mb-10 leading-relaxed">
            Register your school and explore every feature.
            Contact us with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-[#3E4C8C] font-black text-base hover:bg-[#F0F1FF] transition-all shadow-2xl shadow-black/20 hover:scale-[1.02]">
              Get started
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
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
