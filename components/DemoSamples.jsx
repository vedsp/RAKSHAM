'use client';

import { DEMO_SAMPLES } from '@/lib/mock-data.js';
import RiskBadge from './RiskBadge.jsx';
import { truncateText } from '@/lib/utils.js';
import { motion } from 'framer-motion';

export default function DemoSamples({ onSelectSample, trySampleLabel }) {
  return (
    <div className="space-y-6">
      {trySampleLabel && (
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{trySampleLabel}</h3>
          <p className="text-slate-400 font-bold text-sm">Test our protection with these common scam scenarios</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DEMO_SAMPLES.map((sample, i) => (
          <motion.button
            key={sample.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelectSample(sample.text, sample.language)}
            className="text-left bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/50 hover:bg-white/10 transition-all group relative overflow-hidden active:scale-95"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-colors" />
            
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-80">{sample.langFlag}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {sample.label}
                </span>
              </div>
              <RiskBadge
                riskLevel={sample.mockResult.riskLevel}
                score={sample.mockResult.confidenceScore}
                size="sm"
              />
            </div>
            
            <p className="text-sm text-slate-300 font-bold leading-relaxed relative z-10 mb-4 h-10 overflow-hidden line-clamp-2">
              "{truncateText(sample.text, 60)}"
            </p>
            
            <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-[9px] group-hover:translate-x-1 transition-transform relative z-10">
              Check Scenarios 
              <span>→</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
