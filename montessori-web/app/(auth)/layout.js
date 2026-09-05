import Navbar from '../../components/marketing/Navbar';
import Footer from '../../components/marketing/Footer';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#EDECEC]">
      <Navbar />

      {/* Page body — padded container so the card floats in space */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 pt-28">

        {/*
          Outer container — fixed max width, rounded corners, shadow
          so it looks like a contained card rather than a full-screen panel
        */}
        <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl shadow-black/15 flex min-h-[620px]">

          {/* ── Left decorative panel ── */}
          <div className="hidden lg:flex lg:w-[44%] flex-col relative overflow-hidden bg-gradient-to-br from-[#0D1117] via-[#1A1F2E] to-[#0D1117]">
            {/* Orbs */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-[340px] h-[340px] rounded-full bg-[#3E4C8C] opacity-30 blur-[70px]" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-[#5C7A5A] opacity-20 blur-[60px]" />
              {/* Grid */}
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '44px 44px' }} />
            </div>

            <div className="relative z-10 flex flex-col justify-center h-full px-10 py-12">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 rounded-xl bg-[#3E4C8C] flex items-center justify-center">
                  <GraduationCap size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-display font-black text-white text-lg leading-none">Montessori</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Platform</p>
                </div>
              </div>

              <h2 className="font-display font-black text-3xl text-white leading-tight mb-5">
                The ERP & LMS built<br />
                <span className="bg-gradient-to-r from-[#6672AD] to-[#A8B4F0] bg-clip-text text-transparent">
                  for Montessori schools.
                </span>
              </h2>

              <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-xs">
                Manage students, curriculum, attendance, finances, and parent communication — all in one platform.
              </p>

              {/* Feature pills */}
              <div className="space-y-2.5">
                {[
                  { emoji: '🎓', text: 'Five Montessori curriculum areas' },
                  { emoji: '📊', text: 'AI-powered nightly insights' },
                  { emoji: '📵', text: 'Works offline on tablets' },
                  { emoji: '🔒', text: 'Multi-tenant, role-based security' },
                ].map(({ emoji, text }) => (
                  <div key={text}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/6 border border-white/10">
                    <span className="text-base">{emoji}</span>
                    <span className="text-white/70 text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right — auth form ── */}
          <div className="flex-1 flex items-center justify-center bg-white px-8 py-10">
            <div className="w-full max-w-sm">
              {/* Mobile brand mark */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3E4C8C] to-[#5560A8] mb-3 shadow-lg shadow-[#3E4C8C]/30">
                  <GraduationCap size={24} className="text-white" />
                </div>
                <h1 className="font-display text-2xl font-black text-[#1F2430]">Montessori Platform</h1>
                <p className="text-[#5B5F6B] text-sm mt-1">ERP & Learning Management System</p>
              </div>
              {children}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
