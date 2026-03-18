'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowRight, Mic, Search, Globe, CheckCircle, Sparkles, TrendingUp, ShieldAlert, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getUIStrings, detectUILanguage } from '@/lib/ui-strings.js';
import DemoSamples from '@/components/DemoSamples.jsx';

const RakshamLogo = ({ className = "w-10 h-10" }) => (
  <div className={`relative ${className} flex items-center justify-center group overflow-visible`}>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-indigo-800 rounded-3xl overflow-hidden shadow-2xl group-hover:rotate-3 transition-transform">
       <div className="absolute top-0 right-0 w-full h-full bg-[var(--brand-gradient)] opacity-40 mix-blend-overlay" />
    </div>
    <div className="relative z-10 text-white flex items-center justify-center translate-y-[2px]">
       <svg viewBox="0 0 24 24" className="w-2/3 h-2/3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <circle cx="11" cy="11" r="3" fill="currentColor" />
       </svg>
    </div>
    <div className="absolute -top-2 -right-2 text-xs font-black text-indigo-400 opacity-80 animate-pulse">र</div>
    <div className="absolute -bottom-2 -left-2 text-xs font-black text-purple-400 opacity-80 animate-bounce">த</div>
  </div>
);

export default function HomePage() {
  const [lang, setLang] = useState('en');
  const router = useRouter();
  const s = getUIStrings(lang);

  useEffect(() => {
    setLang(detectUILanguage());
  }, []);

  const handleSampleSelect = (text) => {
    sessionStorage.setItem('phishshield-sample', text);
    router.push('/analyze');
  };

  return (
    <div className="relative bg-white min-h-screen overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-indigo-50/50 morphing-blob blur-[120px] opacity-60" />
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-rose-50/50 morphing-blob blur-[120px] opacity-40" style={{ animationDelay: '-5s' }} />
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-blue-50/50 morphing-blob blur-[120px] opacity-30" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 sm:px-12">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-left"
          >
            <div className="flex items-center gap-4 mb-8">
              <RakshamLogo className="w-20 h-20" />
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{s.tagline}</span>
              </div>
            </div>

            <h1 className="text-6xl sm:text-8xl lg:text-[10rem] display-bold text-slate-900 mb-8">
               Universal <br />
               <span className="text-gradient">Security.</span>
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
              <div className="lg:col-span-8">
                <p className="text-2xl sm:text-3xl text-slate-500 font-bold max-w-3xl leading-snug">
                  {s.heroSubtitle}
                </p>
              </div>
              <div className="lg:col-span-4 flex justify-start lg:justify-end pb-2">
                <button 
                  onClick={() => router.push('/analyze')}
                  className="group relative inline-flex items-center gap-4 bg-slate-900 text-white px-10 py-6 rounded-full font-black uppercase tracking-widest overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-900/20"
                >
                  <span className="relative z-10">Start Audit</span>
                  <div className="relative z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="absolute inset-0 bg-[var(--brand-gradient)] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Experience */}
      <section className="px-6 sm:px-12 py-10 pb-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-auto gap-6 bento-grid-overrides">
            
            {/* Main Interactive Check Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-2 lg:col-span-2 lg:row-span-2 bento-card border-2 border-indigo-100 flex flex-col justify-between"
            >
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Smart Check</h3>
                <p className="text-slate-500 font-bold">Paste any message or link to verify its safety instantly in 4+ languages.</p>
              </div>
              
              <div className="mt-12 relative z-10">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center px-4 py-3 gap-3">
                    <Search className="w-6 h-6 text-indigo-600" />
                    <input 
                      type="text" 
                      placeholder={s.pasteMessage} 
                      className="w-full bg-transparent border-none text-slate-700 placeholder:text-slate-400 font-bold"
                      onFocus={() => router.push('/analyze')}
                    />
                  </div>
                  <button
                    onClick={() => router.push('/analyze')}
                    className="bg-indigo-600 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl hover:bg-slate-900 transition-colors"
                  >
                    Analyze
                  </button>
                </div>
              </div>

              {/* Decorative graphic */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -z-0" />
            </motion.div>

            {/* Live Call Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 lg:col-span-2 bento-card group hover:bg-slate-900 group transition-colors duration-500"
            >
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 group-hover:text-white uppercase tracking-tighter mb-2 italic">Live Protection</h3>
                  <p className="text-slate-500 group-hover:text-slate-400 font-bold max-w-[200px]">Real-time detection for active phone calls.</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center shrink-0 animate-soft-pulse border border-rose-100">
                  <Mic className="w-8 h-8 text-rose-600" />
                </div>
              </div>
              <button 
                onClick={() => router.push('/analyze?tab=live')}
                className="mt-12 flex items-center gap-2 text-indigo-600 group-hover:text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] relative z-10"
              >
                Launch Tracker <ArrowUpRight />
              </button>
            </motion.div>

            {/* Stats: Total Scans */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bento-card bg-indigo-600 text-white border-none flex flex-col justify-between"
            >
              <TrendingUp className="w-8 h-8 opacity-40 mb-4" />
              <div>
                <p className="text-5xl font-black tracking-tighter">1,247+</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Scans</p>
              </div>
            </motion.div>

            {/* Stats: High Risk */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bento-card border-rose-100 bg-rose-50/30 flex flex-col justify-between"
            >
              <ShieldAlert className="w-8 h-8 text-rose-600 mb-4" />
              <div>
                <p className="text-5xl font-black tracking-tighter text-slate-900">342</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scams Blocked</p>
              </div>
            </motion.div>

             {/* Language Card */}
             <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1 bento-card flex flex-col justify-between group overflow-visible"
            >
              <div className="flex gap-1 mb-4">
                 <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold">हिं</span>
                 <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold">த</span>
                 <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold">म</span>
                 <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold">En</span>
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">Vernacular</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Native Intelligence</p>
              </div>
            </motion.div>

             {/* Mission Card */}
             <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-1 bento-card bg-slate-50 border-none flex flex-col justify-between hover:scale-[1.02]"
              onClick={() => router.push('/about')}
            >
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500/10 mb-6" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Our Mission</span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                   <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

             {/* Feature Samples */}
             <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="md:col-span-2 lg:col-span-2 bento-card bg-slate-900 border-none p-0 overflow-hidden"
            >
              <div className="p-8 pb-4">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Instant Sandbox</h3>
                 <p className="text-slate-400 text-sm font-bold">Test real-world scenarios with one click.</p>
              </div>
              <div className="px-8 pb-8 max-h-[220px] overflow-y-auto scrollbar-hide">
                 <DemoSamples 
                  onSelectSample={handleSampleSelect}
                  trySampleLabel=""
                 />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Trust Helpline Banner */}
      <section className="px-6 sm:px-12 pb-32">
        <div className="max-w-[1400px] mx-auto bg-rose-600 rounded-[3rem] p-10 sm:p-20 text-white flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[var(--brand-gradient)] opacity-20 pointer-events-none" />
           <div className="relative z-10 max-w-2xl">
              <h2 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter mb-8 leading-none">Victim of Fraud?</h2>
              <p className="text-xl text-rose-100 font-bold leading-relaxed mb-6">
                 If you've already lost money or shared personal details, call the National Cyber Crime Helpline immediately.
              </p>
           </div>
           <div className="relative z-10 flex flex-col items-center lg:items-end gap-2">
              <span className="text-xs font-black uppercase tracking-[0.4em] opacity-60 mb-2 italic">Official Support 24/7</span>
              <a href="tel:1930" className="text-6xl sm:text-[8rem] display-bold text-white hover:scale-105 transition-transform">1930</a>
              <p className="text-sm font-black uppercase tracking-widest text-rose-200">Dial Now to Report</p>
           </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="px-6 sm:px-12 py-12 border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-8">
           <Link href="/" className="flex items-center gap-4 group">
              <RakshamLogo className="w-12 h-12" />
              <span className="text-xl font-black text-slate-900 uppercase tracking-tighter">Raksham India</span>
           </Link>
           <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">© 2024 · Universal Safety for Every Citizen</p>
           <div className="flex gap-12">
              <a href="#" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">Privacy</a>
              <a href="#" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">Docs</a>
           </div>
        </div>
      </footer>
    </div>
  );
}

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );
}
