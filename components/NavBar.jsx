'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import LanguageSelector from './LanguageSelector.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const RakshamLogo = ({ className = "w-10 h-10" }) => (
  <div className={`relative ${className} flex items-center justify-center group overflow-visible`}>
    {/* Shield Base */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-indigo-800 rounded-xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
       <div className="absolute top-0 right-0 w-full h-full bg-[var(--brand-gradient)] opacity-30 mix-blend-overlay" />
    </div>
    
    {/* Magnifying Glass & Eye Icon */}
    <div className="relative z-10 text-white flex items-center justify-center translate-y-[2px]">
       <svg viewBox="0 0 24 24" className="w-2/3 h-2/3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <circle cx="11" cy="11" r="2" fill="currentColor" />
       </svg>
    </div>

    {/* Decorative Elements (Concept of Vernacular) */}
    <div className="absolute -top-1 -right-1 text-[8px] font-bold text-indigo-400 opacity-60 pointer-events-none">र</div>
    <div className="absolute -bottom-1 -left-1 text-[8px] font-bold text-purple-400 opacity-60 pointer-events-none">த</div>
  </div>
);

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Lock scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navLinks = [
    { label: 'Analyze', href: '/analyze', desc: 'Secure smart check' },
    { label: 'History', href: '/history', desc: 'Your audit logs' },
    { label: 'Mission', href: '/about', desc: 'Why Raksham exists' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[60] py-6 px-6 sm:px-12 pointer-events-none">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between pointer-events-auto">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 group">
            <RakshamLogo className="w-12 h-12" />
            <span className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Raksham</span>
          </Link>

          {/* Minimal Desktop Links & Menu Toggle */}
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-6">
               <LanguageSelector />
            </div>
            
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="relative w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-lg transition-transform group-hover:scale-110 active:scale-95">
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                      <X className="w-5 h-5 text-slate-900" />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
                      <Menu className="w-5 h-5 text-slate-900" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm group-hover:bg-slate-50 transition-colors">
                {isOpen ? 'Close' : 'Menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Full Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[55] bg-white flex flex-col pt-32 pb-12 px-8 sm:px-16 lg:px-24"
          >
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-50/50 morphing-blob blur-[120px] -z-10" />

            <div className="flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-4">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Navigation</p>
                  <div className="flex flex-col gap-2">
                    {navLinks.map((link, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                      >
                        <Link 
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="group flex flex-col"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-5xl sm:text-7xl lg:text-8xl display-bold text-slate-900 transition-colors group-hover:text-[var(--brand-primary)]">
                              {link.label}
                            </span>
                            <ArrowUpRight className="w-8 h-8 opacity-0 -translate-x-4 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-[var(--brand-primary)]" />
                          </div>
                          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">
                            {link.desc}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="hidden lg:flex flex-col justify-end gap-12 border-l border-slate-100 pl-20">
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Region</p>
                    <LanguageSelector />
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Emergency</p>
                    <a href="tel:1930" className="text-3xl font-black text-rose-600 hover:underline">
                      Call 1930
                    </a>
                    <p className="text-slate-400 font-medium">National Cyber Crime Helpline</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center py-8 border-t border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">© 2024 Raksham India</p>
               <div className="flex gap-8">
                  <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">Privacy</a>
                  <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">Terms</a>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
