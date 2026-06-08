import type { ViewId } from '../../types';
import { NAV_ITEMS } from './navigation';

interface BottomTabBarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

export function BottomTabBar({ activeView, onNavigate }: BottomTabBarProps) {
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 gap-1 rounded-2xl border border-slate-700/80 bg-slate-950/92 p-1.5 shadow-2xl shadow-slate-950/60 backdrop-blur-xl md:hidden"
      aria-label="Navegacion principal"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = activeView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-1 text-[11px] font-bold transition ${
              active
                ? 'bg-cyan-400/18 text-cyan-100 ring-1 ring-cyan-300/45'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.6 : 2.2} aria-hidden="true" />
            <span className="w-full truncate text-center leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
