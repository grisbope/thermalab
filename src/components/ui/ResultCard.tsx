import type { ReactNode } from 'react';

interface ResultCardProps {
  label: string;
  value: string;
  unit?: string;
  interpretation: ReactNode;
  tone?: 'cold' | 'warm' | 'rad';
}

const tones: Record<NonNullable<ResultCardProps['tone']>, string> = {
  cold: 'border-cyan-300/35 bg-gradient-to-br from-cyan-400/12 to-slate-900/40',
  warm: 'border-orange-300/35 bg-gradient-to-br from-orange-400/12 to-slate-900/40',
  rad: 'border-violet-300/35 bg-gradient-to-br from-violet-400/12 to-slate-900/40',
};

export function ResultCard({ label, value, unit, interpretation, tone = 'warm' }: ResultCardProps) {
  return (
    <article className={`rounded-xl border p-4 transition-colors ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <strong className="font-mono text-2xl font-bold text-slate-50">{value}</strong>
        {unit && <span className="pb-1 text-sm font-semibold text-slate-300">{unit}</span>}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{interpretation}</p>
    </article>
  );
}
