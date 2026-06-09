interface FormulaDisplayProps {
  title: string;
  formula: string;
  substituted: string;
  note?: string;
}

export function FormulaDisplay({ title, formula, substituted, note }: FormulaDisplayProps) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-950/55 p-4">
      <p className="text-sm font-bold text-slate-100">{title}</p>
      <code className="mt-3 block overflow-x-auto rounded-lg bg-slate-950 px-3 py-2.5 font-mono text-sm leading-relaxed text-cyan-100">
        {formula}
      </code>
      <code className="mt-2 block overflow-x-auto rounded-lg bg-slate-900/70 px-3 py-2.5 font-mono text-sm leading-relaxed text-orange-100">
        {substituted}
      </code>
      {note && <p className="mt-3 text-xs leading-relaxed text-slate-400">{note}</p>}
    </div>
  );
}
