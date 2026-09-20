import React from 'react';
import { CLASS_CONFIG, getClassConfig } from '../../config/riskConfig';

const RISK_BADGE_STYLES = {
  Critical: {
    color: "#DC2626",
    bgClass: "bg-red-500/10 text-red-800 dark:text-red-400 border-red-500/30 font-semibold"
  },
  High: {
    color: "#EA580C",
    bgClass: "bg-orange-500/10 text-orange-800 dark:text-orange-400 border-orange-500/30 font-semibold"
  },
  Medium: {
    color: "#D97706",
    bgClass: "bg-amber-500/10 text-amber-900 dark:text-amber-400 border-amber-500/30 font-semibold"
  },
  Low: {
    color: "#16A34A",
    bgClass: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/30 font-semibold"
  }
};

export function RiskBadge({ level }) {
  const config = RISK_BADGE_STYLES[level] || RISK_BADGE_STYLES.Medium;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono border ${config.bgClass}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: config.color }} />
      {level}
    </span>
  );
}

export function ClassBadge({ classNameKey }) {
  const config = getClassConfig(classNameKey);
  const badgeStyle = config.badgeBg || "bg-slate-500/10 text-slate-800 dark:text-slate-300 border-slate-500/30 font-semibold";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${badgeStyle}`}>
      {config.label}
    </span>
  );
}


export function StatusBadge({ status }) {
  const st = (status || 'pending').toLowerCase();
  if (st === 'confirmed') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30">
        Confirmed
      </span>
    );
  }
  if (st === 'rejected') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/30">
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-900 dark:text-amber-400 border border-amber-500/30">
      Pending Review
    </span>
  );
}
