'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, File, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatFileSize, getMimeTypeLabel } from '@/lib/utils.js';
import { motion, AnimatePresence } from 'framer-motion';

const ACCEPTED = '.mp3,.wav,.ogg,.m4a,.webm';
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export default function AudioUploadZone({
  onFileSelect,
  isProcessing,
  progress,
  stage,
  stageLabels,
  dragDropLabel,
  supportedLabel,
  maxSizeLabel,
}) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      setError(null);
      if (file.size > MAX_SIZE) {
        setError('File too large. Maximum size: 20MB');
        return;
      }
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ACCEPTED.split(',').includes(ext)) {
        setError('Unsupported format. Use MP3, WAV, OGG, M4A, or WEBM');
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const stageLabel =
    stage === 'uploading'
      ? stageLabels.uploading
      : stage === 'transcribing'
      ? stageLabels.transcribing
      : stage === 'analyzing'
      ? stageLabels.analyzing
      : '';

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isProcessing && inputRef.current?.click()}
        whileHover={!isProcessing ? { scale: 1.01, borderColor: "var(--brand-primary)" } : {}}
        className={`relative border-2 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]'
            : 'border-slate-200 hover:border-indigo-400 bg-slate-50/30'
        } ${isProcessing ? 'pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
        />
        
        <div className="mb-6 relative inline-block">
          <div className="w-20 h-20 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mx-auto">
             <Upload className={`w-10 h-10 ${dragOver ? 'text-indigo-600' : 'text-slate-400'} transition-colors`} />
          </div>
          <div className="absolute -top-1 -right-1">
             <ShieldCheck className="w-6 h-6 text-indigo-500 bg-white rounded-full p-0.5" />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xl font-bold text-slate-900">{dragDropLabel}</h4>
          <p className="text-sm font-medium text-slate-500 opacity-80">{supportedLabel} · {maxSizeLabel}</p>
        </div>
      </motion.div>

      {/* Selected file & Progress */}
      <AnimatePresence>
        {(selectedFile || error) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Error */}
            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl px-6 py-4 flex items-center gap-3 text-sm font-bold text-rose-600">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Selected file */}
            {selectedFile && (
              <div className="relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden group">
                {/* Progress Background */}
                {isProcessing && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="absolute inset-0 bg-indigo-50/50 z-0 border-r border-indigo-100 transition-all"
                  />
                )}

                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <File className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <p className="text-sm font-bold text-slate-900 truncate">{selectedFile.name}</p>
                       {progress === 100 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {formatFileSize(selectedFile.size)} · {getMimeTypeLabel(selectedFile.type)}
                    </p>
                  </div>
                  
                  {!isProcessing && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} 
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Progress details */}
                {isProcessing && (
                  <div className="mt-4 pt-4 border-t border-slate-100 relative z-10">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.15em]">{stageLabel}</span>
                       <span className="text-xs font-black text-indigo-400">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <motion.div 
                         className="h-full bg-[var(--brand-gradient)] rounded-full"
                         animate={{ width: `${progress}%` }}
                         transition={{ duration: 0.5 }}
                       />
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const AlertCircle = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
