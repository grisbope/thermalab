import type { ReactNode } from 'react';

interface ResultCardProps {
  label: string;
  value: string;
  unit?: string;
  interpretation: ReactNode;
  tone?: 'cold' | 'warm' | 'rad';
}

const tones: Record<NonNullable<ResultCardProps['tone']>, string> = {
  cold: 'border-cyan-300/40 bg-cyan-400/10',
  warm: 'border-orange-300/40 bg-orange-400/10',
  rad: 'border-violet-300/40 bg-violet-400/10',
};

export function ResultCard({ label, value, unit, interpretation, tone = 'warm' }: ResultCardProps) {
  return (
    <article className={`rounded-lg border p-4 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <strong className="font-mono text-2xl text-slate-50">{value}</strong>
        {unit && <span className="pb-1 text-sm font-semibold text-slate-300">{unit}</span>}
      </div>
      <p className="mt-3 text-sm text-slate-300">{interpretation}</p>
    </article>
  );
}
