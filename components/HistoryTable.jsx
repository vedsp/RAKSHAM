'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, FileText, Mic, Phone, ChevronRight } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { motion } from 'framer-motion';

const typeIcons = {
  text: <FileText className="w-4 h-4" />,
  audio: <Mic className="w-4 h-4" />,
  live_call: <Phone className="w-4 h-4" />,
};

export default function HistoryTable({ strings }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/history')
      .then((r) => r.json())
      .then((data) => {
        setRows(data.scans || []);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
          <FileText className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{strings.noScans}</h3>
        <p className="text-slate-500 font-medium max-w-xs mx-auto">Complete a Smart Check to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto min-h-[400px]">
      {/* Desktop table */}
      <table className="w-full hidden sm:table border-collapse">
        <thead>
          <tr className="text-left text-xs text-slate-400 uppercase tracking-[0.15em] font-black border-b border-slate-100 bg-slate-50/50">
            <th className="px-6 py-4">{strings.time}</th>
            <th className="px-6 py-4">{strings.language}</th>
            <th className="px-6 py-4">{strings.type}</th>
            <th className="px-6 py-4">{strings.risk}</th>
            <th className="px-6 py-4">{strings.score}</th>
            <th className="px-6 py-4 text-center">{strings.view}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => (
            <motion.tr
              key={row.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hover:bg-indigo-50/30 cursor-pointer transition-all group"
              onClick={() => router.push(`/result/${row.id}`)}
            >
              <td className="px-6 py-5">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">
                    {new Date(row.created_at).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {new Date(row.created_at).toLocaleString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5 text-sm font-bold text-slate-600">{row.detected_language}</td>
              <td className="px-6 py-5">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                    {typeIcons[row.input_type]}
                  </div>
                  <span className="capitalize">{row.input_type.replace('_', ' ')}</span>
                </span>
              </td>
              <td className="px-6 py-5">
                <RiskBadge riskLevel={row.risk_level} score={row.confidence_score} size="sm" />
              </td>
              <td className="px-6 py-5 text-sm font-black text-slate-900">{row.confidence_score}%</td>
              <td className="px-6 py-5 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-all scale-90 group-hover:scale-100 shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-4 p-4">
        {rows.map((row) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => router.push(`/result/${row.id}`)}
            className="bg-white border border-slate-200 rounded-[1.5rem] p-5 space-y-4 cursor-pointer hover:border-indigo-300 transition-all hover:shadow-lg active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  {typeIcons[row.input_type]}
                </div>
                <div>
                   <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">{row.input_type.replace('_', ' ')}</span>
                   <span className="text-sm font-bold text-slate-900">{row.detected_language}</span>
                </div>
              </div>
              <RiskBadge riskLevel={row.risk_level} score={row.confidence_score} size="sm" />
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
               <span className="text-xs font-bold text-slate-500">
                  {new Date(row.created_at).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
                  })}
               </span>
               <span className="text-sm font-black text-slate-900">{row.confidence_score}% Safety</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
