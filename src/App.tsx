import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Flame,
  FolderOpen,
  History,
  Trash2,
  Waves,
  ThermometerSun,
} from 'lucide-react';
import { Header } from './components/layout/Header';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { Badge } from './components/ui/Badge';
import { Card } from './components/ui/Card';
import { ExportButton } from './components/ui/ExportButton';
import { ConductionModule } from './features/conduction/ConductionModule';
import { ConvectionModule } from './features/convection/ConvectionModule';
import { RadiationModule } from './features/radiation/RadiationModule';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSimulationHistory } from './hooks/useSimulationHistory';
import type { Mechanism, NewSimulation, SavedSimulation, ViewId } from './types';

const moduleLabel: Record<Mechanism, string> = {
  conduction: 'Conducción',
  convection: 'Convección',
  radiation: 'Radiación',
};

const developers =
  'Cedeño Macías Jacksson Rolando, Delgado Quiñonez Aland Michaelson, Loor Córdova María Yolanda, Rodríguez Sol Mildred Domenica, Tapia López Geanine Lizbeth, Velazco De la Cruz Byron Esteban';

const moduleTone: Record<Mechanism, 'warm' | 'cold' | 'rad'> = {
  conduction: 'warm',
  convection: 'cold',
  radiation: 'rad',
};

const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));

function Dashboard({
  onNavigate,
}: {
  onNavigate: (view: ViewId) => void;
}) {
  const cards = [
    {
      id: 'conduction' as const,
      title: 'Conducción',
      icon: Flame,
      tone: 'warm' as const,
      copy: 'Pared simple, capas apiladas y cuánto frena el calor cada material.',
    },
    {
      id: 'convection' as const,
      title: 'Convección',
      icon: Waves,
      tone: 'cold' as const,
      copy: 'Intercambio de calor entre una placa y el aire o fluido, natural y forzada.',
    },
    {
      id: 'radiation' as const,
      title: 'Radiación',
      icon: ThermometerSun,
      tone: 'rad' as const,
      copy: 'Calor emitido por radiación: cuerpo negro, superficies reales y emisividad.',
    },
  ];

  return (
    <div className="animate-fade-in-up space-y-5">
      <section className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/72 p-5 backdrop-blur-sm md:p-6">
        <div className="thermal-strip mb-5 h-2 rounded-full" />
        <Badge tone="neutral">Laboratorio virtual</Badge>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-50 md:text-4xl">
              Explora la transferencia de calor en tiempo real
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
              Conducción, convección y radiación en un solo panel. Ajusta valores, ve fórmulas con datos reales,
              gráficos al instante y guarda tus prácticas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('conduction')}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.25)] transition hover:bg-cyan-300 hover:shadow-[0_0_32px_rgba(56,189,248,0.35)] active:scale-[0.98]"
          >
            <BarChart3 size={18} aria-hidden="true" />
            Iniciar práctica
          </button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onNavigate(card.id)}
              className="group rounded-xl border border-slate-800/80 bg-slate-950/72 p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-slate-900/90 hover:shadow-glow active:scale-[0.99]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="grid size-11 place-items-center rounded-xl border border-slate-700/80 bg-slate-900 transition group-hover:border-cyan-300/30">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <Badge tone={card.tone}>{card.title}</Badge>
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-50">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{card.copy}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-300 opacity-0 transition group-hover:opacity-100">
                Abrir módulo
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden border-cyan-300/25 bg-slate-950/78">
        <div className="thermal-strip -mx-5 -mt-5 mb-5 h-1.5 md:-mx-5" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-1.5 text-sm font-bold text-cyan-100">
              <Code2 size={16} aria-hidden="true" />
              Desarrolladores
            </div>
            <p className="mt-3 text-sm font-semibold leading-relaxed tracking-tight text-slate-100">
              {developers}
            </p>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">
            ThermaLab — herramienta educativa para visualizar mecanismos térmicos sin hojas de cálculo.
          </p>
        </div>
      </Card>
    </div>
  );
}

function HistoryView({
  simulations,
  onLoad,
  onDelete,
  onNameChange,
}: {
  simulations: SavedSimulation[];
  onLoad: (simulation: SavedSimulation) => void;
  onDelete: (id: string) => void;
  onNameChange: (id: string, name: string) => void;
}) {
  if (simulations.length === 0) {
    return (
      <Card title="Historial de prácticas" subtitle="Aún no hay simulaciones guardadas.">
        <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 p-6 text-center">
          <History size={36} className="text-slate-500" aria-hidden="true" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Guarda una práctica desde cualquier módulo para cargarla o exportar sus resultados después.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-4">
      <div>
        <Badge tone="neutral">Prácticas guardadas</Badge>
        <h2 className="mt-3 text-2xl font-black text-slate-50">Historial de prácticas</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Edita nombres, carga parámetros previos, elimina registros o exporta resultados.
        </p>
      </div>
      <div className="grid gap-4">
        {simulations.map((simulation) => (
          <article
            key={simulation.id}
            className="rounded-xl border border-slate-800/80 bg-slate-950/72 p-4 transition hover:border-slate-700"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge tone={moduleTone[simulation.module]}>{moduleLabel[simulation.module]}</Badge>
                  <span className="text-xs font-semibold text-slate-500">
                    {formatDate(simulation.timestamp)}
                  </span>
                </div>
                <input
                  className="h-11 w-full rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 text-sm font-bold text-slate-100 transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                  value={simulation.name}
                  onChange={(event) => onNameChange(simulation.id, event.target.value)}
                  aria-label="Nombre de la simulación"
                />
                <p className="mt-2 text-sm text-slate-400">{simulation.practice}</p>
                <div className="mt-3 grid gap-2 font-mono text-xs text-slate-300 md:grid-cols-3">
                  {Object.entries(simulation.results)
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <span key={key} className="truncate rounded-md bg-slate-900/80 px-2 py-1">
                        {key}: {String(value)}
                      </span>
                    ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => onLoad(simulation)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-400/12 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 active:scale-[0.98]"
                >
                  <FolderOpen size={16} aria-hidden="true" />
                  Cargar
                </button>
                <ExportButton filename={`${simulation.name || 'simulacion'}.json`} data={simulation} />
                <button
                  type="button"
                  onClick={() => onDelete(simulation.id)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-300/40 bg-red-400/12 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-400/20 active:scale-[0.98]"
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Eliminar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useLocalStorage<ViewId>('thermalab:view', 'dashboard');
  const [loadedSimulation, setLoadedSimulation] = useState<SavedSimulation | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const {
    simulations,
    saveSimulation,
    deleteSimulation,
    updateSimulationName,
  } = useSimulationHistory();

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleLoaded = useCallback(() => {
    setLoadedSimulation(null);
  }, []);

  const handleSave = (simulation: NewSimulation) => {
    const saved = saveSimulation(simulation);
    setNotice(`Guardado: ${saved.name}`);
  };

  const handleLoad = (simulation: SavedSimulation) => {
    setLoadedSimulation(simulation);
    setActiveView(simulation.module);
    setNotice(`Cargado: ${simulation.name}`);
  };

  const content = useMemo(() => {
    if (activeView === 'conduction') {
      return <ConductionModule loadedSimulation={loadedSimulation} onLoaded={handleLoaded} onSave={handleSave} />;
    }
    if (activeView === 'convection') {
      return <ConvectionModule loadedSimulation={loadedSimulation} onLoaded={handleLoaded} onSave={handleSave} />;
    }
    if (activeView === 'radiation') {
      return <RadiationModule loadedSimulation={loadedSimulation} onLoaded={handleLoaded} onSave={handleSave} />;
    }
    if (activeView === 'history') {
      return (
        <HistoryView
          simulations={simulations}
          onLoad={handleLoad}
          onDelete={deleteSimulation}
          onNameChange={updateSimulationName}
        />
      );
    }
    return <Dashboard onNavigate={setActiveView} />;
  }, [
    activeView,
    deleteSimulation,
    handleLoaded,
    loadedSimulation,
    simulations,
    updateSimulationName,
  ]);

  return (
    <div className="min-h-screen">
      <Header activeView={activeView} onNavigate={setActiveView} />
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="animate-fade-in-up fixed right-4 top-24 z-40 flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100 shadow-glow backdrop-blur-sm"
        >
          <CheckCircle2 size={16} aria-hidden="true" />
          {notice}
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-5 md:px-6 md:pb-5">
        <section className="min-w-0">{content}</section>
      </main>
      <BottomTabBar activeView={activeView} onNavigate={setActiveView} />
      <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-4 pb-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:px-6">
        <span>ThermaLab — Transferencia de calor</span>
        <span>{developers}</span>
      </footer>
    </div>
  );
}
