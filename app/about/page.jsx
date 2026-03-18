'use client';

import { useEffect, useState } from 'react';
import { getUIStrings, detectUILanguage } from '@/lib/ui-strings.js';
import { Shield, AlertTriangle, Lightbulb, Phone, Users, Globe, Mic, Heart, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const [lang, setLang] = useState('en');
  const s = getUIStrings(lang);

  useEffect(() => {
    setLang(detectUILanguage());
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-24">
      {/* Header */}
      <div className="text-center space-y-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 mx-auto rounded-3xl bg-[var(--brand-gradient)] flex items-center justify-center shadow-2xl shadow-indigo-500/20 animate-soft-pulse"
        >
          <Shield className="w-10 h-10 text-white" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0f172a] tracking-tight">{s.aboutTitle}</h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">{s.aboutDesc}</p>
        </div>
      </div>

      {/* Problem Statement */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-xs font-black uppercase tracking-widest leading-none">
            <AlertTriangle className="w-3.5 h-3.5" />
            {s.problemStatement}
          </div>
          <h2 className="text-3xl font-bold text-slate-900 leading-tight">Digital fraud is targeting our families in their own languages.</h2>
          <div className="space-y-4 text-lg text-slate-600 font-medium leading-relaxed">
            <p>
              India sees over <span className="text-rose-600 font-black">5 million phishing attacks annually</span>, 
              with a significant portion targeting non-English speakers through SMS, WhatsApp, and phone calls.
            </p>
            <p>
              Existing solutions are primarily English-focused and fail to detect scams in Hindi, Marathi, Tamil, 
              and other Indian languages. Raksham was built to bridge this gap.
            </p>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { value: "₹1,750 Cr+", label: "Lost to cyber fraud annually", icon: Target, color: "rose" },
            { value: "66%", label: "Victims are regional language speakers", icon: Globe, color: "indigo" },
            { value: "45-65", label: "Most targeted age group in India", icon: Users, color: "emerald" },
            { value: "5M+", label: "Phishing attempts detected yearly", icon: AlertTriangle, color: "amber" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
               <stat.icon className={`w-8 h-8 text-${stat.color}-500 mb-4`} />
               <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
               <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="bg-slate-900 rounded-[3rem] p-10 sm:p-20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-black uppercase tracking-widest leading-none">
            <Lightbulb className="w-3.5 h-3.5" />
            {s.solution}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight">Raksham: India's Universal Safety Shield</h2>
          <p className="text-lg text-slate-300 font-medium leading-relaxed">
            We use Google Gemini AI to analyze messages and calls in real-time across multiple Indian languages, 
            providing instant scam detection and clear, actionable guidance.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10">
            {[
              { icon: Globe, label: "4+ Languages" },
              { icon: Mic, label: "Live Call Check" },
              { icon: Users, label: "Elderly Friendly" },
              { icon: Shield, label: "Private Audits" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <item.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Call to Action */}
      <section className="text-center py-10">
        <div className="max-w-2xl mx-auto space-y-8">
           <Heart className="w-12 h-12 text-rose-500 mx-auto fill-rose-500/10" />
           <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
           <p className="text-lg text-slate-600 font-medium leading-relaxed">
             Our goal is to ensure that no Indian is left vulnerable to digital scams simply because of a language barrier. 
             Raksham is built for your parents, your grandparents, and for you.
           </p>
           <button 
             onClick={() => window.location.href = '/'}
             className="inline-flex items-center gap-2 bg-[var(--brand-gradient)] text-white font-bold px-10 py-5 rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
           >
              Secure Your Family Today
           </button>
        </div>
      </section>
    </div>
  );
}
