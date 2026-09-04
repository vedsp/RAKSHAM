'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowRight, Mic, Search, Globe, CheckCircle, Sparkles, TrendingUp, ShieldAlert, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getUIStrings, detectUILanguage } from '@/lib/ui-strings.js';
import RakshamLogo from '@/components/RakshamLogo.jsx';
import DemoSamples from '@/components/DemoSamples.jsx';

export default function HomePage() {
  const [lang, setLang] = useState('en');
  const router = useRouter();
  const s = getUIStrings(lang);

  useEffect(() => {
    const syncLang = () => setLang(detectUILanguage());
    syncLang();
    window.addEventListener('storage', syncLang);
    window.addEventListener('language-change', syncLang);
    return () => {
      window.removeEventListener('storage', syncLang);
      window.removeEventListener('language-change', syncLang);
    };
  }, []);

  const handleSampleSelect = (text) => {
    sessionStorage.setItem('phishshield-sample', text);
    router.push('/analyze');
  };

  return (
    <div className="relative bg-white min-h-screen overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Static Subtle Background Gradients (No heavy blur calculations) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-30">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-100 rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-100 rounded-full" />
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
            <div className="flex items-center gap-4 mb-6">
              <RakshamLogo className="w-14 h-14" />
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#6D4AFF] shrink-0" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  <span className="text-[#10172A]">DIGITAL SAFETY</span>
                  <span className="text-slate-400 mx-1.5 font-normal">·</span>
                  <span className="text-[#6D4AFF]">4+ LANGUAGES</span>
                </span>
              </div>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-[8rem] display-bold mb-6 leading-[0.9]">
               <span className="text-[#10172A]">DIGITAL FRAUD.</span> <br />
               <span className="text-[#6D4AFF]">STOPPED EARLY.</span>
            </h1>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <p className="text-xl sm:text-[1.65rem] text-[#52647D] font-bold max-w-2xl leading-snug">
                {s.heroSubtitle}
              </p>
              
              <button 
                onClick={() => router.push('/analyze')}
                className="group relative inline-flex items-center justify-between bg-[#10172A] text-white w-full sm:w-[280px] px-7 py-4.5 rounded-full font-extrabold uppercase tracking-widest text-sm overflow-hidden hover:bg-[#6D4AFF] hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-150 ease-out shadow-xl shadow-slate-900/10 shrink-0 cursor-pointer"
              >
                <span className="relative z-10">Start Audit</span>
                <div className="relative z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-150">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" />
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Experience */}
      <section className="px-6 sm:px-12 py-10 pb-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-auto gap-6 bento-grid-overrides">
                        {/* Main Interactive Check Card */}
            <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 bento-card border-2 border-indigo-100 flex flex-col justify-between">
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
                      className="w-full bg-transparent border-none text-slate-700 placeholder:text-slate-400 font-bold focus:outline-none"
                      onFocus={() => router.push('/analyze')}
                    />
                  </div>
                  <button
                    onClick={() => router.push('/analyze')}
                    className="bg-indigo-600 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    Analyze
                  </button>
                </div>
              </div>
            </div>

             {/* Live Call Card */}
            <div className="md:col-span-2 lg:col-span-2 bento-card group hover:bg-slate-900 transition-colors cursor-pointer" onClick={() => router.push('/analyze?tab=live')}>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 group-hover:text-white uppercase tracking-tighter mb-2 italic">Live Protection</h3>
                  <p className="text-slate-500 group-hover:text-slate-400 font-bold max-w-[200px]">Real-time detection for active phone calls.</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                  <Mic className="w-8 h-8 text-rose-600" />
                </div>
              </div>
              <button 
                onClick={() => router.push('/analyze?tab=live')}
                className="mt-12 flex items-center gap-2 text-indigo-600 group-hover:text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] relative z-10"
              >
                Launch Tracker <ArrowUpRight />
              </button>
            </div>

            {/* Stats: Total Scans */}
            <div className="bento-card bg-indigo-600 text-white border-none flex flex-col justify-between">
              <TrendingUp className="w-8 h-8 opacity-40 mb-4" />
              <div>
                <p className="text-5xl font-black tracking-tighter">1,247+</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Scans</p>
              </div>
            </div>

            {/* Stats: High Risk */}
            <div className="bento-card border-rose-100 bg-rose-50/30 flex flex-col justify-between">
              <ShieldAlert className="w-8 h-8 text-rose-600 mb-4" />
              <div>
                <p className="text-5xl font-black tracking-tighter text-slate-900">342</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scams Blocked</p>
              </div>
            </div>

             {/* Language Card */}
             <div className="lg:col-span-1 bento-card flex flex-col justify-between group overflow-visible">
              <div className="flex gap-1 mb-4">
                 <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-900">हिं</span>
                 <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-900">த</span>
                 <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-900">म</span>
                 <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-900">En</span>
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">Vernacular</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Native Intelligence</p>
              </div>
            </div>

             {/* Mission Card */}
             <div 
              className="lg:col-span-1 bento-card bg-slate-50 border-none flex flex-col justify-between cursor-pointer"
              onClick={() => router.push('/about')}
            >
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500/10 mb-6" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Our Mission</span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                   <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

             {/* Feature Samples */}
             <div className="md:col-span-2 lg:col-span-2 bento-card bg-slate-900 border-none p-0 overflow-hidden">
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
            </div>

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
