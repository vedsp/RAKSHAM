'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Square, Phone, ChevronDown, ChevronUp, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { generateSessionId, formatDuration } from '@/lib/utils.js';
import WaveformCanvas from './WaveformCanvas.jsx';
import ChunkTimeline from './ChunkTimeline.jsx';
import CallSummary from './CallSummary.jsx';
import AlertOverlay from './AlertOverlay.jsx';
import SafetyTipsPanel from './SafetyTipsPanel.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const FRAGMENT_SECONDS = 10;
const MAX_CONCURRENT   = 2;
const SILENCE_THRESHOLD = 0.2;

export default function LiveCallAnalyzer({ strings, language }) {
  const router = useRouter();
  const [state, setState]                   = useState('IDLE');
  const [sessionId, setSessionId]           = useState('');
  const [chunks, setChunks]                 = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [analyser, setAnalyser]             = useState(null);
  const [analyzingChunk, setAnalyzingChunk] = useState(null);
  const [alertPhrase, setAlertPhrase]       = useState('');
  const [fragmentCount, setFragmentCount]   = useState(0);
  const [nextFragIn, setNextFragIn]         = useState(FRAGMENT_SECONDS);
  const [rollingTranscript, setRollingTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [inFlight, setInFlight]             = useState(0);
  const [isDemo, setIsDemo]                 = useState(false);
  const [voiceActivity, setVoiceActivity]   = useState(0);

  const recorderRef      = useRef(null);
  const streamRef        = useRef(null);
  const fragmentQueueRef = useRef([]);
  const fragmentIndexRef = useRef(0);
  const inFlightRef      = useRef(0);
  const timerRef         = useRef(null);
  const countdownRef     = useRef(null);
  const chunkingIntervalRef = useRef(null);
  const audioContextRef  = useRef(null);
  const analyserNodeRef  = useRef(null);
  const sessionIdRef     = useRef('');

  const getVolume = useCallback(() => {
    const node = analyserNodeRef.current;
    if (!node) return 0;
    const data = new Uint8Array(node.frequencyBinCount);
    node.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += Math.abs(data[i] - 128);
    return sum / data.length;
  }, []);

  const drainQueue = useCallback(() => {
    while (
      inFlightRef.current < MAX_CONCURRENT &&
      fragmentQueueRef.current.length > 0
    ) {
      const item = fragmentQueueRef.current.shift();
      inFlightRef.current++;
      setInFlight(inFlightRef.current);
      processFragment(item); 
    }
  }, []); 

  const triggerAlert = useCallback((result) => {
    setState('ALERT');
    // detectedTactics = plain strings (live call); highlightedPhrases = objects (text/audio)
    const phrases =
      result.detectedTactics?.length
        ? result.detectedTactics.join(', ')
        : result.highlightedPhrases
            ?.map((p) => (typeof p === 'string' ? p : p.phrase))
            .filter(Boolean)
            .join(', ') ||
          result.alertMessage ||
          '';
    setAlertPhrase(phrases);
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
  }, []);

  const processFragment = useCallback(
    async (item) => {
      const { blob, fragmentIndex } = item;
      const sid = sessionIdRef.current;
      const startSec = (fragmentIndex - 1) * FRAGMENT_SECONDS;
      const endSec   = fragmentIndex      * FRAGMENT_SECONDS;

      setAnalyzingChunk(fragmentIndex);

      try {
        const formData = new FormData();
        formData.append('audio', blob, `fragment-${fragmentIndex}.webm`);
        formData.append('sessionId', sid);
        formData.append('chunkNumber', fragmentIndex.toString());
        formData.append('fragmentIndex', fragmentIndex.toString());
        formData.append('language', language);

        const res    = await fetch('/api/live-call/chunk', { method: 'POST', body: formData });
        const result = await res.json();

        const fragmentResult = {
          chunkNumber:       result.fragmentIndex ?? fragmentIndex,
          transcript:        result.transcript        || '',
          riskLevel:         result.riskLevel         || 'SAFE',
          confidenceScore:   result.confidenceScore   || 0,
          threatScores:      result.threatScores,
          highlightedPhrases: result.highlightedPhrases || [],
          alertMessage:      result.alertMessage,
          isSilent:          false,
          startSec,
          endSec,
        };

        setChunks((prev) => [...prev, fragmentResult]);
        setAnalyzingChunk(null);

        if (fragmentResult.transcript?.trim()) {
          setRollingTranscript((prev) => prev ? `${prev} ${fragmentResult.transcript}` : fragmentResult.transcript);
        }

        if (fragmentResult.riskLevel === 'HIGH' || fragmentResult.riskLevel === 'CRITICAL' || fragmentResult.riskLevel === 'HIGH_RISK') {
          triggerAlert(fragmentResult);
        }
      } catch {
        setChunks((prev) => [...prev, { chunkNumber: fragmentIndex, transcript: '(Check failed)', riskLevel: 'SAFE', confidenceScore: 0, highlightedPhrases:[], alertMessage: null, isSilent: false, startSec, endSec }]);
        setAnalyzingChunk(null);
      } finally {
        inFlightRef.current = Math.max(0, inFlightRef.current - 1);
        setInFlight(inFlightRef.current);
        drainQueue();
      }
    },
    [language, triggerAlert, drainQueue]
  );

  const startRecording = async () => {
    setState('REQUESTING');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });
      streamRef.current = stream;
      const sid = generateSessionId();
      setSessionId(sid);
      sessionIdRef.current = sid;

      try {
        const res = await fetch('/api/live-call/start', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ language, sessionId: sid }),
        });
        const data = await res.json();
        setIsDemo(data.isDemo);
      } catch { setIsDemo(true); }

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      if (audioContext.state === 'suspended') await audioContext.resume();

      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      audioContext.createMediaStreamSource(stream).connect(analyserNode);
      analyserNodeRef.current = analyserNode;
      setAnalyser(analyserNode);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          fragmentIndexRef.current += 1;
          const idx = fragmentIndexRef.current;
          setFragmentCount(idx);
          const isSilent = getVolume() < SILENCE_THRESHOLD;
          if (isSilent) {
            setChunks((prev) => [...prev, { chunkNumber: idx, transcript: '', riskLevel: 'SAFE', confidenceScore: 0, highlightedPhrases: [], alertMessage: null, isSilent: true, startSec: (idx - 1) * FRAGMENT_SECONDS, endSec: idx * FRAGMENT_SECONDS }]);
            return;
          }
          const mergedBlob = new Blob([e.data], { type: mimeType });
          fragmentQueueRef.current.push({ blob: mergedBlob, fragmentIndex: idx, mimeType });
          drainQueue();
        }
      };

      recorder.start();
      chunkingIntervalRef.current = setInterval(() => {
        if (recorderRef.current && recorderRef.current.state === 'recording') {
          recorderRef.current.stop();
          recorderRef.current.start();
        }
      }, FRAGMENT_SECONDS * 1000);

      setState('ACTIVE');
      setElapsedSeconds(0);
      setFragmentCount(0);
      setChunks([]);
      setRollingTranscript('');
      setNextFragIn(FRAGMENT_SECONDS);

      timerRef.current = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
      countdownRef.current = setInterval(() => {
        setNextFragIn((prev) => (prev <= 1 ? FRAGMENT_SECONDS : prev - 1));
        setVoiceActivity(getVolume());
      }, 250);
    } catch {
      setState('IDLE');
      alert('Microphone access denied.');
    }
  };

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (chunkingIntervalRef.current) clearInterval(chunkingIntervalRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    setAnalyser(null);
    setState('ENDED');
    if (sessionIdRef.current) {
      fetch('/api/live-call/end', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sessionId: sessionIdRef.current }),
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (chunkingIntervalRef.current) clearInterval(chunkingIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, []);

  const peakRisk = chunks.reduce((peak, c) => {
    const order = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3, HIGH_RISK: 3 };
    const currentRisk = c.riskLevel || 'LOW';
    return order[currentRisk] > order[peak] ? currentRisk : peak;
  }, 'LOW');

  const progressPct = Math.round(((FRAGMENT_SECONDS - nextFragIn) / FRAGMENT_SECONDS) * 100);
  const pulseScale = 1 + (voiceActivity / 80);

  return (
    <div className="space-y-8 p-2 sm:p-4">
      {/* Alert Overlay */}
      <AlertOverlay
        visible={state === 'ALERT'}
        detectedPhrase={alertPhrase}
        onHangUp={stopRecording}
        onContinue={() => setState('ACTIVE')}
        strings={{
          thisIsScam: strings.thisIsScam,
          hangUpImmediately: strings.hangUpImmediately,
          hangUp: strings.hangUp,
          continueCall: strings.continueCall,
        }}
      />

      {/* ── IDLE ── */}
      {state === 'IDLE' && (
        <div className="text-center space-y-8 py-12">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-28 h-28 mx-auto rounded-[2.5rem] bg-rose-50 border-2 border-rose-100 flex items-center justify-center relative shadow-sm"
          >
            <Phone className="w-12 h-12 text-rose-500 animate-float" />
            <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-2 rounded-full shadow-lg">
               <ShieldCheck className="w-5 h-5" />
            </div>
          </motion.div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{strings.liveCall}</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
               Secure your phone calls. Raksham will listen and alert you instantly if scam patterns are detected.
            </p>
          </div>

          <button
            onClick={startRecording}
            className="group relative inline-flex items-center gap-4 bg-rose-600 text-white font-black text-xl px-10 py-6 rounded-3xl shadow-2xl shadow-rose-500/20 hover:shadow-rose-500/40 transition-all hover:scale-[1.02] active:scale-95"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            <Mic className="w-8 h-8" />
            {strings.startRecording}
          </button>
          
          <div className="pt-6">
            <SafetyTipsPanel strings={strings} />
          </div>
        </div>
      )}

      {/* ── ACTIVE / ANALYZING ── */}
      {(state === 'ACTIVE' || state === 'ANALYZING' || state === 'REQUESTING') && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-premium relative overflow-hidden">
             {/* Progress Countdown Pulse */}
             <div className="absolute top-0 left-0 h-1.5 bg-indigo-50 w-full overflow-hidden">
                <motion.div 
                   className="h-full bg-[var(--brand-gradient)]"
                   animate={{ width: `${progressPct}%` }}
                   transition={{ duration: 1, ease: "linear" }}
                />
             </div>

             <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <motion.div 
                        animate={{ scale: pulseScale }}
                        className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center"
                      >
                         <Mic className="w-6 h-6 text-rose-500" />
                      </motion.div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                   </div>
                   
                   <div className="text-center sm:text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black text-slate-900 tracking-tight">PROTECTION ACTIVE</span>
                        <span className="text-xs font-bold text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded-md">
                          {formatDuration(elapsedSeconds)}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                         Segment #{fragmentCount} · Check in {nextFragIn}s
                      </p>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   {inFlight > 0 && (
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Analyzing</span>
                     </div>
                   )}
                   <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl hover:bg-slate-800 transition-all font-bold active:scale-95"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    {strings.stopRecording}
                  </button>
                </div>
             </div>

             <div className="mt-8">
               <WaveformCanvas analyser={analyser} isActive={state === 'ACTIVE'} height={80} color="#6366f1" />
             </div>
          </div>

          <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-6">
             <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Smart Check Timeline</h4>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${voiceActivity > SILENCE_THRESHOLD ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Voice Active</span>
                </div>
             </div>
             <ChunkTimeline
               chunks={chunks}
               analyzingChunk={analyzingChunk}
               analyzingLabel={strings.chunkAnalyzing}
             />
          </div>

          {rollingTranscript && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
               <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="w-full flex items-center justify-between text-slate-900 mb-2"
                >
                  <span className="font-bold text-sm uppercase tracking-widest text-slate-400">Live Transcript</span>
                  {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {showTranscript && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-md text-slate-700 font-medium leading-relaxed italic"
                    >
                      "{rollingTranscript}"
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* ── ENDED ── */}
      {state === 'ENDED' && (
        <div className="animate-slide-in">
          <CallSummary
            sessionId={sessionId}
            chunks={chunks}
            peakRisk={peakRisk}
            totalDuration={elapsedSeconds}
            strings={{
              sessionEnded: strings.sessionEnded,
              peakRisk: strings.peakRisk,
              chunksAnalyzed: strings.chunksAnalyzed,
              totalDuration: strings.totalDuration,
              downloadReport: strings.downloadReport,
              callCyberCrime: strings.callCyberCrime,
              shareWhatsApp: strings.shareWhatsApp,
            }}
            appUrl={typeof window !== 'undefined' ? window.location.origin : ''}
          />

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => { setState('IDLE'); setChunks([]); setElapsedSeconds(0); setRollingTranscript(''); }}
              className="flex-1 flex items-center justify-center gap-3 bg-[var(--brand-gradient)] text-white font-bold py-5 rounded-2xl shadow-xl transition-all hover:scale-[1.02]"
            >
              <Mic className="w-5 h-5" />
              Start New Check
            </button>
            <button 
              onClick={() => router.push('/history')}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold py-5 rounded-2xl hover:bg-slate-200 transition-all"
            >
              View History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
