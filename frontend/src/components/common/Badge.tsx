import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status;

  switch (status) {
    case 'VERIFIED':
    case 'READY':
    case 'ACTIVE':
      badgeStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
      label = 'Verified';
      break;
    case 'ATTENTION_REQUIRED':
    case 'NEEDS_ATTENTION':
    case 'WARNING':
    case 'PENDING':
      badgeStyles = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
      label = status === 'PENDING' ? 'In Progress' : 'Attention Required';
      break;
    case 'OVERDUE':
    case 'EXPIRED':
    case 'CRITICAL':
    case 'NOT_READY':
      badgeStyles = 'bg-rose-50 text-rose-800 border-rose-200 font-medium';
      label = status === 'OVERDUE' ? 'Overdue Deadline' : (status === 'EXPIRED' ? 'Expired' : 'Action Needed');
      break;
    case 'DEMO_VERIFIED':
      badgeStyles = 'bg-blue-50 text-blue-800 border-blue-200 font-medium';
      label = 'Demo Verified';
      break;
    case 'UNVERIFIED':
      badgeStyles = 'bg-purple-50 text-purple-800 border-purple-200 font-medium';
      label = 'Unverified Draft';
      break;
    default:
      badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${badgeStyles} ${className}`}>
      {label}
    </span>
  );
};
