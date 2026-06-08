import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  tone?: 'cold' | 'warm' | 'rad' | 'neutral';
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
  cold: 'border-cyan-300/40 bg-cyan-400/12 text-cyan-100',
  warm: 'border-orange-300/40 bg-orange-400/12 text-orange-100',
  rad: 'border-violet-300/40 bg-violet-400/12 text-violet-100',
  neutral: 'border-slate-400/30 bg-slate-700/35 text-slate-100',
};

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
