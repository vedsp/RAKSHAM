'use client';

import { formatDuration, riskColor } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import RiskBadge from './RiskBadge';
import { Download, Phone, Share2 } from 'lucide-react';

export default function CallSummary({
  sessionId,
  chunks,
  peakRisk,
  totalDuration,
  strings,
  appUrl,
}) {
  // Live call chunks use threatScores (0-10), text/audio uses confidenceScore (0-100).
  // Derive a unified 0-100 score from whichever is available.
  const chunkScore = (c) => {
    if (c.confidenceScore != null) return c.confidenceScore;
    if (c.threatScores) {
      const { urgency = 0, impersonation = 0, dataRequest = 0 } = c.threatScores;
      return Math.round(Math.max(urgency, impersonation, dataRequest) * 10);
    }
    return 0;
  };

  const chartData = chunks.map((c) => ({
    chunk: `#${c.chunkNumber}`,
    score: chunkScore(c),
    time: formatDuration(c.chunkNumber * 10),
  }));

  const peakScore = Math.max(...chunks.map(chunkScore), 0);
  const fullTranscript = chunks
    .map((c) => c.transcript)
    .filter(Boolean)
    .join('\n\n');

  const handleDownload = () => {
    const report = {
      sessionId,
      peakRisk,
      totalDuration: formatDuration(totalDuration),
      chunksAnalyzed: chunks.length,
      chunks: chunks.map((c) => ({
        chunkNumber: c.chunkNumber,
        time: formatDuration(c.chunkNumber * 10),
        riskLevel: c.riskLevel,
        confidenceScore: c.confidenceScore,
        transcript: c.transcript,
      })),
      fullTranscript,
      reportGeneratedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phishshield-report-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const shareText = `⚠️ PhishShield Alert: ${peakRisk} (${peakScore}% risk)\nSession: ${sessionId}\n${appUrl}/call/${sessionId}`;

    if (navigator.share) {
      navigator.share({
        title: 'PhishShield चेतावनी',
        text: shareText,
        url: `${appUrl}/call/${sessionId}`,
      }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-xl font-bold text-white">{strings.sessionEnded}</h2>
        <RiskBadge riskLevel={peakRisk} score={peakScore} size="lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1e293b] rounded-xl p-4 text-center border border-[#334155]">
          <p className="text-2xl font-bold text-white font-mono">{formatDuration(totalDuration)}</p>
          <p className="text-xs text-slate-400">{strings.totalDuration}</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl p-4 text-center border border-[#334155]">
          <p className="text-2xl font-bold text-white font-mono">{chunks.length}</p>
          <p className="text-xs text-slate-400">{strings.chunksAnalyzed}</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl p-4 text-center border border-[#334155]">
          <p className="text-2xl font-bold font-mono" style={{ color: riskColor(peakRisk) }}>
            {peakScore}%
          </p>
          <p className="text-xs text-slate-400">{strings.peakRisk}</p>
        </div>
      </div>

      {/* Risk timeline chart */}
      {chunks.length > 1 && (
        <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155]">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Risk Timeline</h3>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="chunk" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Full transcript */}
      {fullTranscript && (
        <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155]">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Full Transcript</h3>
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
            {fullTranscript}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-medium px-4 py-3 rounded-xl hover:bg-blue-500/20 transition-colors"
          style={{ minHeight: 48 }}
        >
          <Download className="w-4 h-4" />
          {strings.downloadReport}
        </button>
        <a
          href="tel:1930"
          className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-medium px-4 py-3 rounded-xl hover:bg-red-500/20 transition-colors"
          style={{ minHeight: 48 }}
        >
          <Phone className="w-4 h-4" />
          {strings.callCyberCrime}
        </a>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 font-medium px-4 py-3 rounded-xl hover:bg-green-500/20 transition-colors"
          style={{ minHeight: 48 }}
        >
          <Share2 className="w-4 h-4" />
          {strings.shareWhatsApp}
        </button>
      </div>
    </div>
  );
}
