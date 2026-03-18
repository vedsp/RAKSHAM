'use client';

import { ShieldCheck, Info, AlertTriangle } from 'lucide-react';

export default function SafetyTipsPanel({ strings }) {
  const tips = [
    { text: strings.safetyTip1, icon: Info, color: 'indigo' },
    { text: strings.safetyTip2, icon: AlertTriangle, color: 'rose' },
    { text: strings.safetyTip3, icon: ShieldCheck, color: 'emerald' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6 px-1">
        <ShieldCheck className="w-5 h-5 text-indigo-600" />
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">{strings.safetyTips}</h4>
      </div>
      <ul className="space-y-4">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:border-indigo-100">
            <div className={`w-8 h-8 rounded-xl bg-${tip.color}-50 flex items-center justify-center shrink-0`}>
              <tip.icon className={`w-4 h-4 text-${tip.color}-600`} />
            </div>
            <span className="text-sm font-bold text-slate-700 leading-relaxed">{tip.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
