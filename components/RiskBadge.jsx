'use client';

import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, AlertTriangle, ShieldOff } from 'lucide-react';

export default function RiskBadge({ riskLevel, score, size = 'md' }) {
  const config = {
    SAFE: { 
      bg: 'bg-emerald-50 border-emerald-100', 
      text: 'text-emerald-700', 
      icon: ShieldCheck, 
      label: 'SAFE' 
    },
    LOW: { 
      bg: 'bg-emerald-50 border-emerald-100', 
      text: 'text-emerald-700', 
      icon: ShieldCheck, 
      label: 'SAFE' 
    },
    SUSPICIOUS: { 
      bg: 'bg-amber-50 border-amber-200', 
      text: 'text-amber-700', 
      icon: AlertTriangle, 
      label: 'SUSPICIOUS' 
    },
    MEDIUM: { 
      bg: 'bg-amber-50 border-amber-200', 
      text: 'text-amber-700', 
      icon: AlertTriangle, 
      label: 'SUSPICIOUS' 
    },
    HIGH_RISK: { 
      bg: 'bg-rose-50 border-rose-200', 
      text: 'text-rose-600', 
      icon: ShieldAlert, 
      label: 'HIGH RISK' 
    },
    HIGH: { 
      bg: 'bg-rose-50 border-rose-200', 
      text: 'text-rose-600', 
      icon: ShieldAlert, 
      label: 'HIGH RISK' 
    },
    CRITICAL: { 
      bg: 'bg-rose-100 border-rose-300', 
      text: 'text-rose-700', 
      icon: ShieldOff, 
      label: 'CRITICAL' 
    },
  };

  const c = config[riskLevel] || config.SAFE;
  const Icon = c.icon;

  const sizeClasses = {
    sm: 'px-3 py-1 text-[10px] gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-6 py-3 text-sm gap-3',
  };

  const iconSizes = { sm: 12, md: 14, lg: 18 };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border shadow-sm font-black tracking-widest uppercase transition-all',
        c.bg,
        c.text,
        sizeClasses[size]
      )}
    >
      <Icon size={iconSizes[size]} className={riskLevel.includes('HIGH') || riskLevel === 'CRITICAL' ? 'animate-pulse' : ''} />
      <span>{c.label}</span>
      {score !== undefined && (
        <div className="flex items-center gap-1 opacity-50 ml-1 border-l pl-2 border-current">
          <span>{score}%</span>
        </div>
      )}
    </div>
  );
}
