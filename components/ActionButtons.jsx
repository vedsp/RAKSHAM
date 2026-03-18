'use client';

import { Share2, AlertTriangle, RefreshCw, Phone, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ActionButtons({
  resultId,
  text,
  score,
  riskLevel,
  appUrl,
  strings,
}) {
  const handleShare = () => {
    const isDangerous = riskLevel === 'HIGH_RISK' || riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
    const brandName = "Raksham";
    const shareText = `⚠️ ${brandName} Warning\nThis content is ${isDangerous ? 'DANGEROUS' : 'SUSPICIOUS'} (${score}% safety audit)\n"${text.slice(0, 80)}..."`;
    const shareUrl = `${appUrl}/result/${resultId}`;

    if (navigator.share) {
      navigator.share({
        title: `${brandName} Security Alert`,
        text: shareText,
        url: shareUrl,
      }).catch(() => {});
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`,
        '_blank'
      );
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-6 z-40 sm:static sm:bg-transparent sm:border-0 sm:p-0">
      <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-3 bg-emerald-50 text-emerald-700 border border-emerald-100 font-black px-6 py-5 rounded-2xl hover:bg-emerald-100 transition-all shadow-sm"
        >
          <Share2 className="w-5 h-5" />
          {strings.shareFamily}
        </motion.button>

        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          href="tel:1930"
          className="flex-1 flex items-center justify-center gap-3 bg-rose-50 text-rose-600 border border-rose-100 font-black px-6 py-5 rounded-2xl hover:bg-rose-100 transition-all shadow-sm"
        >
          <Phone className="w-5 h-5" />
          {strings.report}
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          href="/analyze"
          className="flex-1 flex items-center justify-center gap-3 bg-indigo-50 text-indigo-600 border border-indigo-100 font-black px-6 py-5 rounded-2xl hover:bg-indigo-100 transition-all shadow-sm"
        >
          <RefreshCw className="w-5 h-5" />
          {strings.checkAnother}
        </motion.a>
      </div>

      {(riskLevel === 'HIGH_RISK' || riskLevel === 'HIGH' || riskLevel === 'CRITICAL') && (
        <div className="mt-4 flex justify-center">
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-black text-amber-600 hover:text-amber-700 bg-amber-50 px-4 py-2 rounded-full border border-amber-100 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            OFFICIAL GOVT PORTAL REPORT
          </a>
        </div>
      )}
    </div>
  );
}
