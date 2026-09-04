'use client';

import { useEffect, useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'hi', label: 'हिंदी Hindi', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी Marathi', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ் Tamil', flag: '🇮🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('en');

  useEffect(() => {
    const stored = localStorage.getItem('phishshield-lang');
    if (stored) {
      setCurrent(stored);
    } else {
      const nav = navigator.language?.toLowerCase() || '';
      if (nav.startsWith('hi')) setCurrent('hi');
      else if (nav.startsWith('mr')) setCurrent('mr');
      else if (nav.startsWith('ta')) setCurrent('ta');
      else setCurrent('en');
    }
  }, []);

  const selectLanguage = (lang) => {
    setCurrent(lang);
    localStorage.setItem('phishshield-lang', lang);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('language-change'));
    setOpen(false);
    window.location.reload();
  };

  const currentLang = LANGUAGES.find((l) => l.code === current);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm hover:border-indigo-400 hover:shadow-md transition-all active:scale-95 group"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4 text-indigo-600 transition-transform group-hover:rotate-12" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
           {currentLang?.label.split(' ')[0]}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[2px]" 
              onClick={() => setOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              className="absolute right-0 top-full mt-3 w-56 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden p-2"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => selectLanguage(lang.code)}
                  className={`w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between transition-all ${
                    current === lang.code 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-xs font-bold uppercase tracking-widest">{lang.label}</span>
                  </div>
                  {current === lang.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
