'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { FileText, Upload, Phone, Send, ShieldCheck, Info } from 'lucide-react';
import { getUIStrings, detectUILanguage } from '@/lib/ui-strings.js';
import { detectScript, charCount } from '@/lib/utils.js';
import AudioUploadZone from '@/components/AudioUploadZone.jsx';
import LiveCallAnalyzer from '@/components/LiveCallAnalyzer.jsx';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

function AnalyzeContent() {
  const [lang, setLang] = useState('en');
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [language, setLanguage] = useState('auto');
  const [audioProcessing, setAudioProcessing] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioStage, setAudioStage] = useState('idle');
  const router = useRouter();
  const searchParams = useSearchParams();

  const s = getUIStrings(lang);

  useEffect(() => {
    setLang(detectUILanguage());
    const sample = sessionStorage.getItem('phishshield-sample');
    if (sample) {
      setText(sample);
      sessionStorage.removeItem('phishshield-sample');
    }
  }, []);

  const defaultTab = searchParams.get('tab') === 'live' ? 'live' : 'text';

  const handleTextAnalysis = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });
      const result = await res.json();
      if (result.id) {
        sessionStorage.setItem(`result-${result.id}`, JSON.stringify({ ...result, originalText: text, inputType: 'text' }));
        router.push(`/result/${result.id}`);
      }
    } catch {
      toast.error('Check failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAudioUpload = useCallback(async (file) => {
    setAudioProcessing(true);
    setAudioStage('uploading');
    setAudioProgress(20);

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('language', language);

      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/analyze-audio');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 30) + 10;
            setAudioProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));

        setTimeout(() => { setAudioStage('transcribing'); setAudioProgress(55); }, 2000);
        setTimeout(() => { setAudioStage('analyzing'); setAudioProgress(80); }, 4000);

        xhr.send(formData);
      });

      setAudioProgress(100);
      setAudioStage('done');

      if (result.id) {
        sessionStorage.setItem(`result-${result.id}`, JSON.stringify({ ...result, inputType: 'audio' }));
        router.push(`/result/${result.id}`);
      }
    } catch {
      toast.error('Audio security check failed. Please try again.');
    } finally {
      setAudioProcessing(false);
      setAudioStage('idle');
      setAudioProgress(0);
    }
  }, [language, router]);

  const script = detectScript(text);

  const languageOptions = [
    { value: 'auto', label: `${s.autoDetect}` },
    { value: 'Hindi', label: 'हिंदी Hindi' },
    { value: 'Marathi', label: 'मराठी Marathi' },
    { value: 'Tamil', label: 'தமிழ் Tamil' },
    { value: 'English', label: 'English' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4 transition-all">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">{s.appName} Smart Check</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          How can we help protect you today?
        </h1>
      </motion.div>

      <Tabs.Root defaultValue={defaultTab} className="space-y-8">
        <Tabs.List className="flex bg-slate-100/80 backdrop-blur-sm rounded-2xl p-1.5 border border-slate-200 shadow-inner">
          <Tabs.Trigger
            value="text"
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 text-sm font-bold rounded-xl text-slate-500 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xl transition-all"
          >
            <FileText className="w-5 h-5" />
            {s.textAnalysis}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="audio"
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 text-sm font-bold rounded-xl text-slate-500 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-xl transition-all"
          >
            <Upload className="w-5 h-5" />
            {s.audioUpload}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="live"
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 text-sm font-bold rounded-xl text-slate-500 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-xl transition-all"
          >
            <Phone className="w-5 h-5" />
            {s.liveCallTab}
          </Tabs.Trigger>
        </Tabs.List>

        {/* TEXT TAB */}
        <Tabs.Content value="text" className="space-y-6 animate-slide-in">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {text && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Info className="w-3.5 h-3.5" />
                  {charCount(text)} chars · Script: {script}
                </div>
              )}
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={s.pasteMessage}
              rows={6}
              className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-3xl px-6 py-5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/30 focus:bg-white transition-all resize-none text-lg leading-relaxed mb-6"
              style={{ minHeight: 180 }}
            />

            <button
              onClick={handleTextAnalysis}
              disabled={!text.trim() || analyzing}
              className="w-full flex items-center justify-center gap-3 bg-[var(--brand-gradient)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-[1.01] active:scale-95 text-xl"
            >
              {analyzing ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  {s.analyzing}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {s.analyze}
                </>
              )}
            </button>
          </div>
          
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-3">
             <ShieldCheck className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
             <p className="text-sm text-indigo-700 font-medium leading-relaxed">
               Raksham's smart check uses universal safety patterns to identify phishing attempts even in mixed languages. Your data is analyzed privately.
             </p>
          </div>
        </Tabs.Content>

        {/* AUDIO TAB */}
        <Tabs.Content value="audio" className="space-y-6 animate-slide-in">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium p-8 text-center">
            <div className="flex justify-center mb-6">
               <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <AudioUploadZone
              onFileSelect={handleAudioUpload}
              isProcessing={audioProcessing}
              progress={audioProgress}
              stage={audioStage}
              stageLabels={{
                uploading: s.uploading,
                transcribing: s.transcribing,
                analyzing: s.analyzing,
              }}
              dragDropLabel={s.dragDrop}
              supportedLabel={s.supported}
              maxSizeLabel={s.maxSize}
            />
          </div>
        </Tabs.Content>

        {/* LIVE CALL TAB */}
        <Tabs.Content value="live" className="animate-slide-in">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium p-4">
            <LiveCallAnalyzer strings={s} language={language} />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <AnalyzeContent />
    </Suspense>
  );
}
