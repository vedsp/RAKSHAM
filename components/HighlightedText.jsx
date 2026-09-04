'use client';

import { motion } from 'framer-motion';

export default function HighlightedText({ text, highlightedPhrases }) {
  // Filter out any malformed entries missing a phrase
  const validPhrases = (highlightedPhrases || []).filter((p) => p && typeof p.phrase === 'string' && p.phrase.trim() !== '');

  if (!validPhrases || validPhrases.length === 0) {
    return <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap font-medium">{text}</p>;
  }

  // Build regex from all phrases
  const escapedPhrases = validPhrases.map((p) =>
    p.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const pattern = new RegExp(`(${escapedPhrases.join('|')})`, 'gi');
  const parts = text.split(pattern);

  const severityClasses = {
    high: 'bg-rose-100 text-rose-700 border-b-2 border-rose-400',
    medium: 'bg-amber-100 text-amber-700 border-b-2 border-amber-400',
    low: 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-200',
  };

  return (
    <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap font-medium">
      {parts.map((part, i) => {
        const match = validPhrases.find(
          (p) => p.phrase.toLowerCase() === part.toLowerCase()
        );
        if (match) {
          return (
            <span
              key={i}
              className={`relative cursor-help group px-1 rounded-sm mx-0.5 transition-all ${severityClasses[match.severity] || ''}`}
            >
              {part}
              {/* Premium Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white w-64 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-95 group-hover:scale-100 origin-bottom">
                <span className="block font-black text-slate-400 uppercase tracking-widest mb-1">Observation</span>
                {match.reason}
                {/* Carrot */}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
              </span>
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
