import { useEffect, useMemo, useState } from 'react';
import { Orbit, Radiation, Save } from 'lucide-react';
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
  calculateRadiation,
  formatNumber,
  generateEmissivityCurve,
  generateRadiationTemperatureCurve,
  SIGMA,
  toKelvin,
  validateCelsius,
  validateEmissivity,
  validatePositive,
} from '../../lib/calculations';
import { getSurface, SURFACES } from '../../lib/surfaces';
import type { NewSimulation, SavedSimulation, SimulationValue } from '../../types';
import { BLACKBODY_PRACTICE } from './PracticeBlackbody';
import { EMISSIVITY_PRACTICE } from './PracticeEmissivity';

interface RadiationModuleProps {
  loadedSimulation: SavedSimulation | null;
  onLoaded: () => void;
  onSave: (simulation: NewSimulation) => void;
}

const INVALID = '—';
const INPUT_ERROR = 'Revisa los valores ingresados.';

const selectClass =
  'h-11 w-full rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 text-sm font-semibold text-slate-100 transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30';

const numberFrom = (value: SimulationValue | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const stringFrom = (value: SimulationValue | undefined, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

export function RadiationModule({ loadedSimulation, onLoaded, onSave }: RadiationModuleProps) {
  const [practice, setPractice] = useState(EMISSIVITY_PRACTICE.name);
  const [simulationName, setSimulationName] = useState('Radiación — emisividad');
  const [surfaceId, setSurfaceId] = useState(EMISSIVITY_PRACTICE.surfaceId);
  const [customEpsilon, setCustomEpsilon] = useState(getSurface(EMISSIVITY_PRACTICE.surfaceId).epsilon);
  const [area, setArea] = useState(EMISSIVITY_PRACTICE.area);
  const [surfaceC, setSurfaceC] = useState(EMISSIVITY_PRACTICE.surfaceC);
  const [ambientC, setAmbientC] = useState(EMISSIVITY_PRACTICE.ambientC);

  useEffect(() => {
    if (loadedSimulation?.module !== 'radiation') return;
    setPractice(loadedSimulation.practice);
    setSimulationName(loadedSimulation.name);
    const loadedSurfaceId = stringFrom(loadedSimulation.parameters.surfaceId, EMISSIVITY_PRACTICE.surfaceId);
    setSurfaceId(loadedSurfaceId);
    setCustomEpsilon(numberFrom(loadedSimulation.parameters.epsilon, getSurface(loadedSurfaceId).epsilon));
    setArea(numberFrom(loadedSimulation.parameters.area, EMISSIVITY_PRACTICE.area));
    setSurfaceC(numberFrom(loadedSimulation.parameters.surfaceC, EMISSIVITY_PRACTICE.surfaceC));
    setAmbientC(numberFrom(loadedSimulation.parameters.ambientC, EMISSIVITY_PRACTICE.ambientC));
    onLoaded();
  }, [loadedSimulation, onLoaded]);

  const surface = getSurface(surfaceId);
  const epsilon = customEpsilon;
  const errors = [
    validatePositive('Área', area),
    validateEmissivity(epsilon),
    validateCelsius('Temperatura superficial', surfaceC),
    validateCelsius('Temperatura ambiente', ambientC),
  ].filter((message): message is string => Boolean(message));

  const result = useMemo(
    () => (errors.length === 0 ? calculateRadiation(epsilon, area, surfaceC, ambientC) : null),
    [ambientC, area, epsilon, errors.length, surfaceC],
  );

  const emissivityCurve = useMemo(
    () => (errors.length === 0 ? generateEmissivityCurve(area, surfaceC, ambientC) : []),
    [ambientC, area, errors.length, surfaceC],
  );

  const temperatureCurve = useMemo(
    () => (errors.length === 0 ? generateRadiationTemperatureCurve(ambientC, area, [1, 0.5, 0.1]) : []),
    [ambientC, area, errors.length],
  );

  const comparisonData = useMemo(() => {
    if (errors.length > 0) return [];
    return ['black_paint', 'oxidized_steel', 'polished_steel', 'polished_copper'].map((id) => {
      const item = getSurface(id);
      return {
        label: item.name,
        q: calculateRadiation(item.epsilon, area, surfaceC, ambientC).q,
      };
    });
  }, [ambientC, area, errors.length, surfaceC]);

  const loadEmissivityPractice = () => {
    const practiceSurface = getSurface(EMISSIVITY_PRACTICE.surfaceId);
    setPractice(EMISSIVITY_PRACTICE.name);
    setSimulationName('Radiación — pintura negra');
    setSurfaceId(EMISSIVITY_PRACTICE.surfaceId);
    setCustomEpsilon(practiceSurface.epsilon);
    setArea(EMISSIVITY_PRACTICE.area);
    setSurfaceC(EMISSIVITY_PRACTICE.surfaceC);
    setAmbientC(EMISSIVITY_PRACTICE.ambientC);
  };

  const loadBlackbodyPractice = () => {
    const practiceSurface = getSurface(BLACKBODY_PRACTICE.surfaceId);
    setPractice(BLACKBODY_PRACTICE.name);
    setSimulationName('Radiación — cuerpo negro');
    setSurfaceId(BLACKBODY_PRACTICE.surfaceId);
    setCustomEpsilon(practiceSurface.epsilon);
    setArea(BLACKBODY_PRACTICE.area);
    setSurfaceC(BLACKBODY_PRACTICE.surfaceC);
    setAmbientC(BLACKBODY_PRACTICE.ambientC);
  };

  const handleSurfaceChange = (id: string) => {
    setSurfaceId(id);
    setCustomEpsilon(getSurface(id).epsilon);
  };

  const q = result?.q ?? 0;
  const exportData = {
    name: simulationName,
    module: 'radiation',
    practice,
    parameters: {
      surfaceId,
      surfaceName: surface.name,
      epsilon,
      area,
      surfaceC,
      ambientC,
      surfaceK: toKelvin(surfaceC),
      ambientK: toKelvin(ambientC),
    },
    results: {
      q: result?.q ?? null,
      blackbodyPower: result?.blackbodyPower ?? null,
      sigma: SIGMA,
    },
  };

  const saveActiveSimulation = () => {
    onSave({
      name: simulationName.trim() || 'Simulación de radiación',
      module: 'radiation',
      practice,
      parameters: exportData.parameters,
      results: exportData.results,
    });
  };

  return (
    <div className="animate-fade-in-up space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Badge tone="rad">Stefan-Boltzmann</Badge>
          <h2 className="mt-3 text-2xl font-black text-slate-50">Módulo de radiación</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
            Explora cómo las superficies emiten calor por radiación y cómo la emisividad cambia el resultado.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadEmissivityPractice}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-violet-300/40 bg-violet-400/12 px-3 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-400/20 active:scale-[0.98]"
          >
            <Radiation size={16} aria-hidden="true" />
            Práctica 1
          </button>
          <button
            type="button"
            onClick={loadBlackbodyPractice}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-orange-300/40 bg-orange-400/12 px-3 py-2 text-sm font-semibold text-orange-100 transition hover:bg-orange-400/20 active:scale-[0.98]"
          >
            <Orbit size={16} aria-hidden="true" />
            Práctica 2
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,420px)_1fr]">
        <Card title="Variables de entrada" subtitle={practice}>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">
                Nombre de la simulación
              </span>
              <input
                className="h-11 w-full rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 text-sm text-slate-100 transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                value={simulationName}
                onChange={(event) => setSimulationName(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">Superficie</span>
              <select className={selectClass} value={surfaceId} onChange={(event) => handleSurfaceChange(event.target.value)}>
                {SURFACES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — ε={item.epsilon}
                  </option>
                ))}
              </select>
            </label>

            <SliderInput
              label="Emisividad (ε)"
              value={epsilon}
              min={0}
              max={1}
              step={0.001}
              unit="0 a 1"
              onChange={setCustomEpsilon}
              error={validateEmissivity(epsilon)}
            />
            <SliderInput
              label="Área (A)"
              value={area}
              min={0.01}
              max={20}
              step={0.01}
              unit="m²"
              onChange={setArea}
              error={validatePositive('Área', area)}
            />
            <SliderInput
              label="Temperatura superficial"
              value={surfaceC}
              min={-50}
              max={800}
              step={1}
              unit="°C"
              onChange={setSurfaceC}
              error={validateCelsius('Temperatura superficial', surfaceC)}
            />
            <SliderInput
              label="Temperatura ambiente"
              value={ambientC}
              min={-50}
              max={400}
              step={1}
              unit="°C"
              onChange={setAmbientC}
              error={validateCelsius('Temperatura ambiente', ambientC)}
            />

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={saveActiveSimulation}
                disabled={errors.length > 0}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-violet-300/40 bg-violet-500/18 px-3 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Save size={16} aria-hidden="true" />
                Guardar
              </button>
              <ExportButton filename="thermalab-radiacion.json" data={exportData} />
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <ThermalDiagram
            type="radiation"
            radiation={{
              surfaceC,
              ambientC,
              epsilon,
              q,
            }}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <ResultCard
              label="Radiación neta"
              value={errors.length ? INVALID : formatNumber(q, 2)}
              unit={errors.length ? undefined : 'W'}
              tone="rad"
              interpretation={
                errors.length
                  ? INPUT_ERROR
                  : `La superficie intercambia ${formatNumber(Math.abs(q) / area, 2)} W/m² netos.`
              }
            />
            <ResultCard
              label="Emisión máxima teórica"
              value={errors.length ? INVALID : formatNumber(result?.blackbodyPower ?? 0, 2)}
              unit={errors.length ? undefined : 'W/m²'}
              tone="warm"
              interpretation="Máxima energía que podría emitir esa superficie si fuera un cuerpo negro ideal."
            />
            <ResultCard
              label="Emisividad (ε)"
              value={formatNumber(epsilon, 3)}
              tone="cold"
              interpretation={`${surface.name}: qué tan parecida es al cuerpo negro perfecto (0 = nada, 1 = igual).`}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Calor radiado según la emisividad" subtitle="ε desde 0 hasta 1,0">
          <TemperatureProfileChart
            data={emissivityCurve}
            series={[{ dataKey: 'q', name: 'Q', color: '#a78bfa' }]}
            xLabel="Emisividad"
            yLabel="Q (W)"
          />
        </Card>
        <Card title="Cuerpo negro vs gris" subtitle="Calor emitido según la temperatura, para distintas emisividades">
          <TemperatureProfileChart
            data={temperatureCurve}
            series={[
              { dataKey: 'e1', name: 'ε 1,0', color: '#f97316' },
              { dataKey: 'e0_5', name: 'ε 0,5', color: '#38bdf8' },
              { dataKey: 'e0_1', name: 'ε 0,1', color: '#a78bfa' },
            ]}
            xLabel="Temperatura"
            yLabel="Q (W)"
          />
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Comparación entre superficies" subtitle="Misma área y temperatura, distinta emisividad">
          <ComparisonBarChart data={comparisonData} dataKey="q" name="Q (W)" color="#a78bfa" />
        </Card>
        <Card title="Fórmula activa" subtitle={practice}>
          <FormulaDisplay
            title="Superficie gris"
            formula="Q_rad = ε * σ * A * (T_superficie⁴ - T_ambiente⁴)"
            substituted={`Q = ${formatNumber(epsilon, 3)} * ${SIGMA.toExponential(3)} * ${formatNumber(
              area,
            )} * (${formatNumber(toKelvin(surfaceC), 2)}⁴ - ${formatNumber(toKelvin(ambientC), 2)}⁴) = ${
              errors.length ? 'valores no válidos' : `${formatNumber(q, 2)} W`
            }`}
            note="En radiación, la temperatura se convierte internamente a kelvin (K) antes de elevar a la cuarta potencia."
          />
        </Card>
      </div>
    </div>
  );
}
