import { Flame, Sparkles } from 'lucide-react';
import type { ViewId } from '../../types';
import { NAV_ITEMS } from './navigation';

interface HeaderProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

export function Header({ activeView, onNavigate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/88 backdrop-blur">
      <div className="thermal-strip h-1 w-full" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-orange-300/45 bg-orange-500/16 text-orange-300 shadow-[0_0_28px_rgba(249,115,22,0.24)]">
            <Flame size={25} fill="currentColor" strokeWidth={1.8} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black text-slate-50 md:text-2xl">
              ThermaLab
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Sparkles size={14} aria-hidden="true" />
                Simulacion interactiva de transferencia de calor
              </span>
            </p>
          </div>
        </div>

        <nav className="hidden shrink-0 items-center gap-1 md:flex" aria-label="Navegacion principal">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                title={item.label}
                aria-label={item.label}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition ${
                  active
                    ? 'bg-cyan-400/18 text-cyan-100 ring-1 ring-cyan-300/45'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <Icon size={17} strokeWidth={active ? 2.6 : 2.2} aria-hidden="true" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
