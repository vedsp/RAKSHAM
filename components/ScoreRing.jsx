'use client';

import { useEffect, useRef } from 'react';
import { riskColor } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ScoreRing({ score, riskLevel, size = 160 }) {
  const circleRef = useRef(null);
  const center = size / 2;
  const strokeWidth = 10;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  
  // Custom colors for light theme
  const getBrandColor = (risk) => {
    if (risk === 'SAFE' || risk === 'LOW') return '#10b981'; // Emerald
    if (risk === 'SUSPICIOUS' || risk === 'MEDIUM') return '#f59e0b'; // Amber
    return '#f43f5e'; // Rose
  };

  const color = getBrandColor(riskLevel);

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    const offset = circumference - (score / 100) * circumference;
    circle.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
    circle.style.strokeDashoffset = String(offset);
  }, [score, circumference]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-3xl opacity-20 transition-colors duration-500"
        style={{ backgroundColor: color }}
      />
      
      <svg width={size} height={size} className="-rotate-90 relative z-10">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" stopColor={color} stopOpacity="0.8" />
             <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          ref={circleRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <motion.span 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl font-black text-slate-900 tracking-tighter"
        >
          {score}<span className="text-lg opacity-30">%</span>
        </motion.span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Safety-Audit</span>
      </div>
    </div>
  );
}
