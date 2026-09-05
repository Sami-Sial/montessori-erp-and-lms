'use client';
import { useState } from 'react';
import { Mail, Phone, MessageSquare, Clock, CheckCircle2, ArrowRight, MapPin, Send } from 'lucide-react';

const TOPICS = [
  'General inquiry',
  'Technical support',
  'Partnership',
  'Press / media',
  'Other',
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', school: '', topic: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to send message. Please check the fields and try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send message. Please try again later.');
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const inputClass = "w-full px-4 py-3.5 rounded-xl border-2 border-[#E2DFD8] bg-[#F8F7F5] text-[#1F2430] text-sm placeholder:text-[#9A9DAA] focus:outline-none focus:border-[#3E4C8C] focus:bg-white transition-colors";

  return (
    <div>
      {/* Header */}
      <section className="py-24 bg-[#0D1117] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#3E4C8C] opacity-20 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-[#5C7A5A] opacity-10 blur-[70px]" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/8 text-white/70 text-xs font-bold uppercase tracking-widest mb-6">
            Get in touch
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black mb-5 leading-tight">
            Let's{' '}
            <span className="bg-gradient-to-r from-[#6672AD] to-[#A8B4F0] bg-clip-text text-transparent">
              talk.
            </span>
          </h1>
          <p className="text-xl text-white/60 leading-relaxed">
            Have a question, need a demo, or just want to say hello?
            We respond within 1 business day.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#F8F7F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">

            {/* Left info */}
            <div className="lg:col-span-2 space-y-5">

              {/* Response time */}
              <div className="bg-white rounded-2xl border border-[#E2DFD8] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3E4C8C]/10 flex items-center justify-center">
                    <Clock size={18} className="text-[#3E4C8C]" />
                  </div>
                  <p className="font-bold text-[#1F2430]">Response time</p>
                </div>
                <p className="text-[#5B5F6B] text-sm leading-relaxed">
                  We reply to all messages within <strong className="text-[#1F2430]">1 business day</strong>.
                  For urgent matters email us directly.
                </p>
              </div>

              {/* Contact details */}
              <div className="bg-white rounded-2xl border border-[#E2DFD8] p-6 shadow-sm space-y-4">
                <p className="font-bold text-[#1F2430] text-sm uppercase tracking-wide">Direct contact</p>
                {[
                  { icon: Mail,  label: 'Email', value: 'samisial1555@gmail.com', href: 'mailto:samisial1555@gmail.com' },
                  { icon: Phone, label: 'Phone', value: '+92 314 6180920',         href: 'tel:+923146180920' },
                  { icon: MapPin,label: 'Location', value: 'Pakistan', href: null },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#F8F7F5] border border-[#E2DFD8] flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-[#3E4C8C]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#9A9DAA] font-medium">{label}</p>
                      {href
                        ? <a href={href} className="text-sm font-semibold text-[#3E4C8C] hover:underline">{value}</a>
                        : <p className="text-sm font-semibold text-[#1F2430]">{value}</p>
                      }
                    </div>
                  </div>
                ))}
              </div>

              {/* Topics */}
              <div className="bg-gradient-to-br from-[#3E4C8C] to-[#5560A8] rounded-2xl p-6 text-white shadow-lg shadow-[#3E4C8C]/25">
                <p className="font-bold text-sm uppercase tracking-wide mb-3 text-white/70">We can help with</p>
                <ul className="space-y-2">
                  {TOPICS.map(t => (
                    <li key={t} className="flex items-center gap-2 text-sm text-white/85">
                      <CheckCircle2 size={14} className="text-white/50 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="bg-white rounded-2xl border border-[#E2DFD8] p-12 text-center shadow-sm h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-[#4B8B6F]/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={40} className="text-[#4B8B6F]" />
                  </div>
                  <h2 className="font-display text-2xl font-black text-[#1F2430] mb-2">Message sent!</h2>
                  <p className="text-[#5B5F6B]">We'll get back to you within 1 business day.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E2DFD8] p-8 shadow-sm">
                  <h2 className="font-display text-2xl font-black text-[#1F2430] mb-1">Send us a message</h2>
                  <p className="text-[#5B5F6B] text-sm mb-7">We read every message and respond personally.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-xs font-bold text-[#1F2430] mb-1.5 uppercase tracking-wide">Your name *</label>
                        <input id="name" required value={form.name} onChange={set('name')}
                          placeholder="Diana Patel" className={inputClass} />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-xs font-bold text-[#1F2430] mb-1.5 uppercase tracking-wide">Email address *</label>
                        <input id="email" type="email" required value={form.email} onChange={set('email')}
                          placeholder="diana@school.edu" className={inputClass} />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="school" className="block text-xs font-bold text-[#1F2430] mb-1.5 uppercase tracking-wide">School name</label>
                      <input id="school" value={form.school} onChange={set('school')}
                        placeholder="Sunrise Montessori Academy" className={inputClass} />
                    </div>

                    <div>
                      <label htmlFor="topic" className="block text-xs font-bold text-[#1F2430] mb-1.5 uppercase tracking-wide">Topic *</label>
                      <select id="topic" required value={form.topic} onChange={set('topic')}
                        className={inputClass}>
                        <option value="">Select a topic…</option>
                        {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-xs font-bold text-[#1F2430] mb-1.5 uppercase tracking-wide">Message *</label>
                      <textarea id="message" required rows={5} value={form.message} onChange={set('message')}
                        placeholder="Tell us about your school and how we can help…"
                        className={`${inputClass} resize-none`} />
                    </div>

                    <button type="submit"
                      className="group w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-[#3E4C8C] to-[#5560A8] text-white font-bold text-base hover:from-[#4A59A8] hover:to-[#6672C0] transition-all shadow-lg shadow-[#3E4C8C]/25 hover:scale-[1.01]">
                      Send message
                      <Send size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <p className="text-xs text-[#9A9DAA] text-center">
                      By submitting you agree to our{' '}
                      <a href="/privacy" className="text-[#3E4C8C] hover:underline">Privacy Policy</a>.
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
