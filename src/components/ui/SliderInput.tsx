interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  error?: string | null;
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  error,
}: SliderInputProps) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-200">{label}</span>
        <span className="rounded-md bg-slate-800/80 px-2 py-0.5 font-mono text-xs text-slate-400">{unit}</span>
      </div>
      <div className="grid grid-cols-[1fr_112px] items-center gap-3">
        <input
          className="h-2 w-full cursor-pointer accent-cyan-400"
          type="range"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : min}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <input
          className="h-10 rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 text-right font-mono text-sm text-slate-100 transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
          type="number"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : ''}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
      {error && <p className="mt-2 text-xs font-medium text-orange-200">{error}</p>}
    </label>
  );
}
