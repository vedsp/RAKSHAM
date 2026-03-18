'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, PhoneOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertOverlay({
  visible,
  detectedPhrase,
  onHangUp,
  onContinue,
  strings,
}) {
  const [bgRed, setBgRed] = useState(true);

  useEffect(() => {
    if (!visible) return;

    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.type = 'square';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) { }

    const interval = setInterval(() => {
      setBgRed((prev) => !prev);
    }, 600);

    return () => clearInterval(interval);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8 transition-colors duration-500 overflow-hidden"
           style={{ backgroundColor: bgRed ? '#be123c' : '#881337' }}
        >
          {/* Pulse Background Circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <motion.div 
               animate={{ scale: [1, 2], opacity: [0.5, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="w-[400px] h-[400px] rounded-full bg-white/10"
             />
             <motion.div 
               animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
               transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
               className="w-[300px] h-[300px] rounded-full bg-white/20"
             />
          </div>

          <div className="relative z-10 text-center max-w-lg mx-auto space-y-10">
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-32 h-32 mx-auto bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl"
            >
              <ShieldAlert className="w-16 h-16 text-rose-600" />
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase">{strings.thisIsScam}</h2>
              <div className="h-1.5 w-24 bg-white/30 mx-auto rounded-full" />
              <p className="text-2xl font-black text-rose-100/90">{strings.hangUpImmediately}</p>
            </div>

            {detectedPhrase && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-black/40 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                   <AlertCircle className="w-4 h-4 text-rose-300" />
                   <span className="text-xs font-black text-rose-200 uppercase tracking-widest leading-none">Detected Tactic</span>
                </div>
                <p className="text-xl font-bold text-white leading-relaxed italic">"{detectedPhrase}"</p>
              </motion.div>
            )}

            <div className="flex flex-col gap-4">
              <button
                onClick={onHangUp}
                className="group relative w-full flex items-center justify-center gap-4 bg-white text-rose-600 font-black text-2xl px-10 py-7 rounded-[2rem] shadow-2xl transition-all hover:scale-[1.05] active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-rose-100 opacity-50" />
                <PhoneOff className="w-8 h-8" />
                {strings.hangUp}
              </button>

              <button
                onClick={onContinue}
                className="text-white/40 font-bold hover:text-white/80 transition-colors py-4 uppercase tracking-widest text-xs"
              >
                {strings.continueCall} / IGNORE WARNING
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
