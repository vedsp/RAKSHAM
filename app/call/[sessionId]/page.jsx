'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getUIStrings, detectUILanguage } from '@/lib/ui-strings';
import LiveCallAnalyzer from '@/components/LiveCallAnalyzer';

export default function CallPage() {
  const params = useParams();
  const sessionId = params.sessionId;
  const [lang, setLang] = useState('en');
  const s = getUIStrings(lang);

  useEffect(() => {
    setLang(detectUILanguage());
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">{s.liveCall}</h1>
        <p className="text-xs text-slate-500 font-mono mt-1">Session: {sessionId}</p>
      </div>
      <LiveCallAnalyzer strings={s} language="auto" />
    </div>
  );
}
