import { useEffect, useMemo, useState } from 'react';
import { Fan, Save, Wind } from 'lucide-react';
import { ComparisonBarChart } from '../../components/charts/ComparisonBarChart';
import { TemperatureProfileChart } from '../../components/charts/TemperatureProfileChart';
import { ThermalDiagram } from '../../components/charts/ThermalDiagram';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ExportButton } from '../../components/ui/ExportButton';
import { FormulaDisplay } from '../../components/ui/FormulaDisplay';
import { ResultCard } from '../../components/ui/ResultCard';
import { SliderInput } from '../../components/ui/SliderInput';
import {
  calculateForcedConvection,
  calculateNaturalConvectionAir,
  formatNumber,
  generateCoolingProfile,
  validateCelsius,
  validateNonNegative,
  validatePositive,
} from '../../lib/calculations';
import { FLUIDS, getFluid } from '../../lib/fluids';
import type { NewSimulation, SavedSimulation, SimulationValue } from '../../types';
import { COOLING_PRACTICE } from './PracticeCooling';
import { NATURAL_FORCED_PRACTICE } from './PracticeNaturalVsForced';

interface ConvectionModuleProps {
  loadedSimulation: SavedSimulation | null;
  onLoaded: () => void;
  onSave: (simulation: NewSimulation) => void;
}

const selectClass =
  'h-11 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm font-semibold text-slate-100';

const numberFrom = (value: SimulationValue | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const stringFrom = (value: SimulationValue | undefined, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

export function ConvectionModule({ loadedSimulation, onLoaded, onSave }: ConvectionModuleProps) {
  const [practice, setPractice] = useState(COOLING_PRACTICE.name);
  const [simulationName, setSimulationName] = useState('Conveccion - placa metalica');
  const [fluidId, setFluidId] = useState(COOLING_PRACTICE.fluidId);
  const [velocity, setVelocity] = useState(COOLING_PRACTICE.velocity);
  const [length, setLength] = useState(COOLING_PRACTICE.length);
  const [area, setArea] = useState(COOLING_PRACTICE.area);
  const [surfaceC, setSurfaceC] = useState(COOLING_PRACTICE.surfaceC);
  const [fluidC, setFluidC] = useState(COOLING_PRACTICE.fluidC);

  useEffect(() => {
    if (loadedSimulation?.module !== 'convection') return;
    setPractice(loadedSimulation.practice);
    setSimulationName(loadedSimulation.name);
    setFluidId(stringFrom(loadedSimulation.parameters.fluidId, COOLING_PRACTICE.fluidId));
    setVelocity(numberFrom(loadedSimulation.parameters.velocity, COOLING_PRACTICE.velocity));
    setLength(numberFrom(loadedSimulation.parameters.length, COOLING_PRACTICE.length));
    setArea(numberFrom(loadedSimulation.parameters.area, COOLING_PRACTICE.area));
    setSurfaceC(numberFrom(loadedSimulation.parameters.surfaceC, COOLING_PRACTICE.surfaceC));
    setFluidC(numberFrom(loadedSimulation.parameters.fluidC, COOLING_PRACTICE.fluidC));
    onLoaded();
  }, [loadedSimulation, onLoaded]);

  const fluid = getFluid(fluidId);
  const air = getFluid('air');
  const errors = [
    validateNonNegative('Velocidad', velocity),
    validatePositive('Longitud caracteristica', length),
    validatePositive('Area', area),
    validateCelsius('Temperatura superficial', surfaceC),
    validateCelsius('Temperatura del fluido', fluidC),
  ].filter((message): message is string => Boolean(message));

  const forcedResult = useMemo(
    () => (errors.length === 0 ? calculateForcedConvection(fluid, velocity, length, area, surfaceC, fluidC) : null),
    [area, errors.length, fluid, fluidC, length, surfaceC, velocity],
  );

  const naturalResult = useMemo(
    () => (errors.length === 0 ? calculateNaturalConvectionAir(air, length, area, surfaceC, fluidC) : null),
    [air, area, errors.length, fluidC, length, surfaceC],
  );

  const coolingProfile = useMemo(
    () =>
      forcedResult ? generateCoolingProfile(surfaceC, fluidC, Math.max(forcedResult.h, 0.001), area) : [],
    [area, fluidC, forcedResult, surfaceC],
  );

  const comparisonData = useMemo(() => {
    if (errors.length > 0) return [];
    return ['air', 'water', 'ethanol', 'oil'].map((id) => {
      const item = getFluid(id);
      return {
        label: item.name,
        q: calculateForcedConvection(item, Math.max(velocity, 0.001), length, area, surfaceC, fluidC).q,
      };
    });
  }, [area, errors.length, fluidC, length, surfaceC, velocity]);

  const loadCoolingPractice = () => {
    setPractice(COOLING_PRACTICE.name);
    setSimulationName('Conveccion - placa con aire');
    setFluidId(COOLING_PRACTICE.fluidId);
    setVelocity(COOLING_PRACTICE.velocity);
    setLength(COOLING_PRACTICE.length);
    setArea(COOLING_PRACTICE.area);
    setSurfaceC(COOLING_PRACTICE.surfaceC);
    setFluidC(COOLING_PRACTICE.fluidC);
  };

  const loadNaturalForcedPractice = () => {
    setPractice(NATURAL_FORCED_PRACTICE.name);
    setSimulationName('Conveccion - natural vs forzada');
    setFluidId(NATURAL_FORCED_PRACTICE.fluidId);
    setVelocity(NATURAL_FORCED_PRACTICE.velocity);
    setLength(NATURAL_FORCED_PRACTICE.length);
    setArea(NATURAL_FORCED_PRACTICE.area);
    setSurfaceC(NATURAL_FORCED_PRACTICE.surfaceC);
    setFluidC(NATURAL_FORCED_PRACTICE.fluidC);
  };

  const forcedQ = forcedResult?.q ?? 0;
  const exportData = {
    name: simulationName,
    module: 'convection',
    practice,
    parameters: {
      fluidId,
      velocity,
      length,
      area,
      surfaceC,
      fluidC,
      rho: fluid.rho,
      mu: fluid.mu,
      Pr: fluid.Pr,
    },
    results: {
      q: forcedResult?.q ?? null,
      re: forcedResult?.re ?? null,
      nu: forcedResult?.nu ?? null,
      h: forcedResult?.h ?? null,
      regime: forcedResult?.regime ?? null,
      naturalH: naturalResult?.h ?? null,
      naturalQ: naturalResult?.q ?? null,
      ra: naturalResult?.ra ?? null,
    },
  };

  const saveActiveSimulation = () => {
    onSave({
      name: simulationName.trim() || 'Simulacion de conveccion',
      module: 'convection',
      practice,
      parameters: exportData.parameters,
      results: exportData.results,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Badge tone="cold">Ley de Newton</Badge>
          <h2 className="mt-3 text-2xl font-black text-slate-50">Modulo de conveccion</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Calcula transferencia superficie-fluido, regimen de flujo y coeficiente convectivo estimado.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadCoolingPractice}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-cyan-300/40 bg-cyan-400/12 px-3 py-2 text-sm font-semibold text-cyan-100"
          >
            <Wind size={16} aria-hidden="true" />
            P1 placa
          </button>
          <button
            type="button"
            onClick={loadNaturalForcedPractice}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-orange-300/40 bg-orange-400/12 px-3 py-2 text-sm font-semibold text-orange-100"
          >
            <Fan size={16} aria-hidden="true" />
            P2 comparar
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,420px)_1fr]">
        <Card title="Variables experimentales" subtitle={practice}>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">
                Nombre de simulacion
              </span>
              <input
                className="h-11 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100"
                value={simulationName}
                onChange={(event) => setSimulationName(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">Fluido</span>
              <select className={selectClass} value={fluidId} onChange={(event) => setFluidId(event.target.value)}>
                {FLUIDS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - Pr={item.Pr}, k={item.k} W/m K
                  </option>
                ))}
              </select>
            </label>

            <SliderInput
              label="Velocidad del fluido"
              value={velocity}
              min={0}
              max={20}
              step={0.1}
              unit="m/s"
              onChange={setVelocity}
              error={validateNonNegative('Velocidad', velocity)}
            />
            <SliderInput
              label="Longitud caracteristica"
              value={length}
              min={0.01}
              max={2}
              step={0.01}
              unit="m"
              onChange={setLength}
              error={validatePositive('Longitud caracteristica', length)}
            />
            <SliderInput
              label="Area de placa"
              value={area}
              min={0.01}
              max={5}
              step={0.01}
              unit="m2"
              onChange={setArea}
              error={validatePositive('Area', area)}
            />
            <SliderInput
              label="Temperatura superficial"
              value={surfaceC}
              min={-50}
              max={600}
              step={1}
              unit="C"
              onChange={setSurfaceC}
              error={validateCelsius('Temperatura superficial', surfaceC)}
            />
            <SliderInput
              label="Temperatura del fluido"
              value={fluidC}
              min={-50}
              max={300}
              step={1}
              unit="C"
              onChange={setFluidC}
              error={validateCelsius('Temperatura del fluido', fluidC)}
            />

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={saveActiveSimulation}
                disabled={errors.length > 0}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/40 bg-cyan-500/18 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Save size={16} aria-hidden="true" />
                Guardar
              </button>
              <ExportButton filename="thermalab-conveccion.json" data={exportData} />
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <ThermalDiagram
            type="convection"
            convection={{
              surfaceC,
              fluidC,
              velocity,
              h: forcedResult?.h ?? 0,
              q: forcedResult?.q ?? 0,
              regime: forcedResult?.regime ?? 'Sin datos',
            }}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <ResultCard
              label="Transferencia Q"
              value={errors.length ? 'Revise' : formatNumber(forcedQ, 2)}
              unit={errors.length ? undefined : 'W'}
              tone="cold"
              interpretation={
                errors.length
                  ? 'Hay variables fuera del rango fisico permitido.'
                  : `Esta tasa equivale a ${formatNumber(Math.abs(forcedQ) / 1000, 3)} kW hacia el fluido.`
              }
            />
            <ResultCard
              label="Coeficiente h"
              value={errors.length ? 'Revise' : formatNumber(forcedResult?.h ?? 0, 3)}
              unit={errors.length ? undefined : 'W/m2 K'}
              tone="warm"
              interpretation="h resume la intensidad del intercambio convectivo."
            />
            <ResultCard
              label="Regimen"
              value={errors.length ? 'Revise' : forcedResult?.regime ?? 'Sin datos'}
              tone="rad"
              interpretation={errors.length ? 'Corrija las entradas.' : `Re = ${formatNumber(forcedResult?.re ?? 0, 2)}`}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Perfil de enfriamiento" subtitle="Estimacion para placa de acero de 5 mm">
          <TemperatureProfileChart
            data={coolingProfile}
            series={[{ dataKey: 'temperatura', name: 'Temperatura', color: '#38bdf8' }]}
            xLabel="Tiempo"
            yLabel="Temperatura (C)"
          />
        </Card>
        <Card title="Comparacion entre fluidos" subtitle="Misma placa, velocidad y temperaturas">
          <ComparisonBarChart data={comparisonData} dataKey="q" name="Q (W)" color="#f97316" />
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Natural vs forzada" subtitle="Correlacion natural con aire y placa vertical">
          <div className="grid gap-4 md:grid-cols-2">
            <ResultCard
              label="h natural"
              value={errors.length ? 'Revise' : formatNumber(naturalResult?.h ?? 0, 3)}
              unit={errors.length ? undefined : 'W/m2 K'}
              tone="cold"
              interpretation={naturalResult?.validity ?? 'Sin calculo.'}
            />
            <ResultCard
              label="h forzada"
              value={errors.length ? 'Revise' : formatNumber(forcedResult?.h ?? 0, 3)}
              unit={errors.length ? undefined : 'W/m2 K'}
              tone="warm"
              interpretation={forcedResult?.validity ?? 'Sin calculo.'}
            />
          </div>
        </Card>
        <Card title="Formula activa" subtitle={practice}>
          <FormulaDisplay
            title="Conveccion forzada en placa plana"
            formula="Re = (rho * v * L) / mu; Nu = C * Re^n * Pr^(1/3); h = Nu * k / L; Q = h * A * (T_s - T_f)"
            substituted={`Re = ${formatNumber(forcedResult?.re ?? 0, 2)}; Nu = ${formatNumber(
              forcedResult?.nu ?? 0,
              2,
            )}; h = ${formatNumber(forcedResult?.h ?? 0, 3)}; Q = ${
              errors.length ? 'entrada no valida' : `${formatNumber(forcedQ, 2)} W`
            }`}
            note={forcedResult?.validity ?? 'Complete las entradas para calcular.'}
          />
        </Card>
      </div>
    </div>
  );
}
