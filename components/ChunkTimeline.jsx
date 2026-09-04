'use client';

import { riskColor } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function fmtSec(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function ChunkTimeline({
  chunks,
  analyzingChunk,
  analyzingLabel,
}) {
  const riskIcon = {
    // Text/audio analysis labels
    SAFE:      '🟢',
    SUSPICIOUS:'🟡',
    HIGH_RISK: '🔴',
    // Live call labels
    LOW:       '🟢',
    MEDIUM:    '🟡',
    HIGH:      '🔴',
    CRITICAL:  '🆘',
  };

  // Most recent first
  const sortedChunks = [...chunks].sort(
    (a, b) => b.chunkNumber - a.chunkNumber
  );

  const hasTimeRange = (c) =>
    c.startSec !== undefined && c.endSec !== undefined;

  const fragmentLabel = (c) => {
    if (hasTimeRange(c)) {
      return `Fragment ${c.chunkNumber} · ${fmtSec(c.startSec)}–${fmtSec(c.endSec)}`;
    }
    return `Fragment ${c.chunkNumber}`;
  };

  return (
    <div className="space-y-3">
      {/* Currently analyzing indicator */}
      {analyzingChunk !== null && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-blue-300">
            Fragment {analyzingChunk} — {analyzingLabel}
          </span>
        </div>
      )}

      {/* Fragment results */}
      <AnimatePresence>
        {sortedChunks.map((chunk) =>
          chunk.isSilent ? (
            /* Silent fragment — compact grey badge */
            <motion.div
              key={chunk.chunkNumber}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 flex items-center gap-2"
            >
              <span className="text-slate-600 text-xs">♦</span>
              <span className="text-xs text-slate-500 font-mono">
                {fragmentLabel(chunk)} &mdash; silent
              </span>
            </motion.div>
          ) : (
            /* Normal analysed fragment */
            <motion.div
              key={chunk.chunkNumber}
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#1e293b] border rounded-xl px-4 py-3 space-y-2"
              style={{ borderColor: riskColor(chunk.riskLevel) + '40' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{riskIcon[chunk.riskLevel]}</span>
                  <span className="text-sm font-medium text-white">
                    {fragmentLabel(chunk)}
                  </span>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: riskColor(chunk.riskLevel) }}
                >
                  {chunk.riskLevel.replace('_', ' ')}
                  {chunk.confidenceScore != null ? ` ${chunk.confidenceScore}%` : ''}
                </span>
              </div>

              {/* Transcript */}
              {chunk.transcript && (
                <p className="text-xs text-slate-400 leading-relaxed">{chunk.transcript}</p>
              )}

              {/* Detected phrases */}
              {chunk.highlightedPhrases && chunk.highlightedPhrases.length > 0 && (
                <p className="text-xs text-slate-300">
                  <span className="text-slate-500">Detected: </span>
                  {chunk.highlightedPhrases
                    .map((p) => `"${typeof p === 'string' ? p : p.phrase}"`)
                    .join(', ')}
                </p>
              )}
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Empty state */}
      {chunks.length === 0 && analyzingChunk === null && (
        <div className="text-center py-8 text-slate-500 text-sm">
        Fragment results will appear here every 10 seconds during recording
        </div>
      )}
    </div>
  );
}
