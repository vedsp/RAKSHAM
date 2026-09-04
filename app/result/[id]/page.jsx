'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUIStrings, detectUILanguage } from '@/lib/ui-strings.js';
import RiskBadge from '@/components/RiskBadge.jsx';
import ScoreRing from '@/components/ScoreRing.jsx';
import ThreatRadar from '@/components/ThreatRadar.jsx';
import HighlightedText from '@/components/HighlightedText.jsx';
import ActionButtons from '@/components/ActionButtons.jsx';
import { createBrowserClient, isSupabaseConfigured } from '@/lib/supabase.js';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en');
  const s = getUIStrings(lang);

  useEffect(() => {
    setLang(detectUILanguage());

    const cached = sessionStorage.getItem(`result-${id}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setResult({
          id,
          inputType: parsed.inputType || 'text',
          originalText: parsed.originalText || parsed.original_text,
          transcript: parsed.transcript,
          detectedLanguage: parsed.detectedLanguage || parsed.detected_language || 'Unknown',
          riskLevel: parsed.riskLevel || parsed.risk_level,
          confidenceScore: parsed.confidenceScore || parsed.confidence_score,
          threatScores: parsed.threatScores || parsed.threat_scores,
          highlightedPhrases: parsed.highlightedPhrases || parsed.highlighted_phrases || [],
          explanation: parsed.explanation || [],
          similarPatterns: parsed.similarPatterns || parsed.similar_patterns || [],
        });
        setLoading(false);

        if (parsed.riskLevel === 'HIGH_RISK' || parsed.risk_level === 'HIGH' || parsed.risk_level === 'CRITICAL') {
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      } catch { }
    }

    if (isSupabaseConfigured()) {
      const supabase = createBrowserClient();
      supabase
        .from('scan_history')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setResult({
              id: data.id,
              inputType: data.input_type,
              originalText: data.original_text,
              transcript: data.transcript,
              detectedLanguage: data.detected_language,
              riskLevel: data.risk_level,
              confidenceScore: data.confidence_score,
              threatScores: data.threat_scores,
              highlightedPhrases: data.highlighted_phrases || [],
              explanation: data.explanation || [],
              similarPatterns: data.similar_patterns || [],
            });
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-xl font-bold text-slate-900">Preparing Security Report...</p>
        <p className="text-slate-500 mt-2 font-medium">Analyzing patterns and safety signals</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <ShieldAlert className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-xl font-bold text-slate-900">Report not found</p>
        <button onClick={() => router.push('/analyze')} className="mt-4 text-indigo-600 font-bold hover:underline">
          Go back to Smart Check
        </button>
      </div>
    );
  }

  const messageText = result.originalText || result.transcript || '';
  const isHighRisk = result.riskLevel === 'HIGH_RISK' || result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL';

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 pb-32">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={() => router.push('/analyze')}
          className="flex items-center gap-2 bg-slate-900 text-white font-bold px-5 py-2.5 rounded-full hover:bg-slate-700 active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold uppercase tracking-widest leading-none">
          {result.detectedLanguage} Check
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Summary & Highlights */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-[2.5rem] border-2 p-8 shadow-premium ${
              isHighRisk ? 'bg-rose-50/30 border-rose-100' : 'bg-emerald-50/30 border-emerald-100'
            }`}
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{s.resultTitle}</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Internal ID: {result.id.slice(0, 8)}</p>
              </div>
              <RiskBadge riskLevel={result.riskLevel} score={result.confidenceScore} size="lg" />
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isHighRisk ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                   {isHighRisk ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                 </div>
                 <h3 className="text-lg font-bold text-slate-900">
                    {isHighRisk ? s.thisIsScam : "This looks safe"}
                 </h3>
              </div>
              <p className={`text-md leading-relaxed font-medium ${isHighRisk ? 'text-rose-700' : 'text-slate-600'}`}>
                {isHighRisk ? s.hangUpImmediately : "Our analysis didn't find any common scam patterns in this content. However, always remain cautious."}
              </p>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-slate-200">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Content Analyzed</h3>
               <div className="max-h-48 overflow-y-auto scrollbar-hide">
                 <HighlightedText text={messageText} highlightedPhrases={result.highlightedPhrases} />
               </div>
            </div>
          </motion.div>

          {/* Detailed Findings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm"
          >
            <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              Key Findings
              <div className="px-2 py-0.5 rounded-md bg-indigo-50 text-[var(--brand-primary)] text-[10px] font-bold uppercase leading-none">Smart-Scan</div>
            </h3>
            
            <ul className="space-y-4">
               {result.explanation.map((point, i) => (
                 <li key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-start">
                   <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-xs font-bold text-slate-500">
                     {i + 1}
                   </div>
                   <p className="text-slate-700 font-medium leading-relaxed">{point}</p>
                 </li>
               ))}
               {result.explanation.length === 0 && (
                 <p className="text-slate-400 font-medium italic italic-center py-4">No specific risks detected.</p>
               )}
            </ul>
          </motion.div>
        </div>

        {/* Right Column: Scoring & Actions */}
        <div className="lg:col-span-5 space-y-8">
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm text-center"
          >
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">{s.score}</h3>
            <div className="flex justify-center mb-8">
               <ScoreRing score={result.confidenceScore} riskLevel={result.riskLevel} />
            </div>
            <p className="text-slate-500 font-bold leading-relaxed px-4">
              Our safety rating is based on semantic analysis and known fraud heuristics.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-indigo-950 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden group border border-indigo-800/50"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors" />
            <div className="flex justify-between items-center mb-2 relative z-10">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest block">Safety Profile</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-900/80 px-2.5 py-1 rounded-full border border-indigo-700/50">Radar View</span>
            </div>
            <div className="relative z-10">
              <ThreatRadar threatScores={result.threatScores} lightMode={false} />
            </div>
            <p className="text-[11px] text-indigo-200/70 mt-2 leading-relaxed font-medium text-center">
               Patterns matching common phishing, impersonation, and pressure tactics.
            </p>
          </motion.div>

          <div className="space-y-4">
            <ActionButtons
              resultId={id}
              text={messageText}
              score={result.confidenceScore}
              riskLevel={result.riskLevel}
              appUrl={typeof window !== 'undefined' ? window.location.origin : ''}
              strings={{
                shareFamily: s.shareFamily,
                report: s.report,
                checkAnother: s.checkAnother,
                onlineReport: s.onlineReport,
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Pattern Alerts */}
      {result.similarPatterns && result.similarPatterns.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-extrabold text-slate-900">Known Patterns Detected</h3>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {result.similarPatterns.map((pattern, i) => (
               <div key={i} className="flex group">
                 <div className="w-1.5 rounded-l-2xl bg-indigo-500 group-hover:w-2 transition-all" />
                 <div className="bg-slate-50 border border-slate-100 border-l-0 rounded-r-2xl p-5 flex-1 transition-all group-hover:bg-indigo-50">
                    <h4 className="font-bold text-slate-900 mb-1">{pattern.name}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{pattern.description}</p>
                 </div>
               </div>
             ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
