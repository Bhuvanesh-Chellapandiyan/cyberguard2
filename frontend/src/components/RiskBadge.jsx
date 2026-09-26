import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

const RiskBadge = ({ risk, size = 'md' }) => {
  const normalized = (risk || 'LOW').toUpperCase();

  const styles = {
    LOW: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
      text: 'Low Risk',
      pulse: 'bg-emerald-400',
    },
    MEDIUM: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      text: 'Medium Risk',
      pulse: 'bg-amber-400',
    },
    HIGH: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30 glow-rose',
      icon: ShieldAlert,
      text: 'High Risk',
      pulse: 'bg-rose-400',
    },
  };

  const current = styles[normalized] || styles.LOW;
  const Icon = current.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${sizeClasses} backdrop-blur-md`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.pulse} animate-pulse`} />
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {current.text}
    </span>
  );
};

export default RiskBadge;
