'use client';

import { useEffect, useState } from 'react';
import { getUIStrings, detectUILanguage } from '@/lib/ui-strings';
import HistoryTable from '@/components/HistoryTable.jsx';
import { Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HistoryPage() {
  const [lang, setLang] = useState('en');
  const s = getUIStrings(lang);

  useEffect(() => {
    setLang(detectUILanguage());
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <Clock className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{s.history}</h1>
            <p className="text-slate-500 font-medium text-sm">Review your past security audits</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-xs font-bold uppercase tracking-widest">
           <ShieldCheck className="w-4 h-4" />
           Raksham Active
        </div>
      </motion.div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-premium overflow-hidden">
        <div className="p-2 sm:p-4">
          <HistoryTable
            strings={{
              time: s.time,
              language: s.language,
              type: s.type,
              risk: s.risk,
              score: s.score,
              view: s.view,
              noScans: s.noScans,
            }}
          />
        </div>
      </div>
    </div>
  );
}
