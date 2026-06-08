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

const selectClass =
  'h-11 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm font-semibold text-slate-100';

const numberFrom = (value: SimulationValue | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const stringFrom = (value: SimulationValue | undefined, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

export function RadiationModule({ loadedSimulation, onLoaded, onSave }: RadiationModuleProps) {
  const [practice, setPractice] = useState(EMISSIVITY_PRACTICE.name);
  const [simulationName, setSimulationName] = useState('Radiacion - emisividad');
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
    validatePositive('Area', area),
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
    setSimulationName('Radiacion - pintura negra');
    setSurfaceId(EMISSIVITY_PRACTICE.surfaceId);
    setCustomEpsilon(practiceSurface.epsilon);
    setArea(EMISSIVITY_PRACTICE.area);
    setSurfaceC(EMISSIVITY_PRACTICE.surfaceC);
    setAmbientC(EMISSIVITY_PRACTICE.ambientC);
  };

  const loadBlackbodyPractice = () => {
    const practiceSurface = getSurface(BLACKBODY_PRACTICE.surfaceId);
    setPractice(BLACKBODY_PRACTICE.name);
    setSimulationName('Radiacion - cuerpo negro');
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
      name: simulationName.trim() || 'Simulacion de radiacion',
      module: 'radiation',
      practice,
      parameters: exportData.parameters,
      results: exportData.results,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Badge tone="rad">Stefan-Boltzmann</Badge>
          <h2 className="mt-3 text-2xl font-black text-slate-50">Modulo de radiacion</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Evalua emision de superficies grises y el impacto de temperatura absoluta y emisividad.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadEmissivityPractice}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-violet-300/40 bg-violet-400/12 px-3 py-2 text-sm font-semibold text-violet-100"
          >
            <Radiation size={16} aria-hidden="true" />
            P1 emisividad
          </button>
          <button
            type="button"
            onClick={loadBlackbodyPractice}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-orange-300/40 bg-orange-400/12 px-3 py-2 text-sm font-semibold text-orange-100"
          >
            <Orbit size={16} aria-hidden="true" />
            P2 cuerpo negro
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
              <span className="mb-2 block text-sm font-semibold text-slate-200">Superficie</span>
              <select className={selectClass} value={surfaceId} onChange={(event) => handleSurfaceChange(event.target.value)}>
                {SURFACES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - epsilon={item.epsilon}
                  </option>
                ))}
              </select>
            </label>

            <SliderInput
              label="Emisividad epsilon"
              value={epsilon}
              min={0}
              max={1}
              step={0.001}
              unit="0 a 1"
              onChange={setCustomEpsilon}
              error={validateEmissivity(epsilon)}
            />
            <SliderInput
              label="Area A"
              value={area}
              min={0.01}
              max={20}
              step={0.01}
              unit="m2"
              onChange={setArea}
              error={validatePositive('Area', area)}
            />
            <SliderInput
              label="Temperatura superficial"
              value={surfaceC}
              min={-50}
              max={800}
              step={1}
              unit="C"
              onChange={setSurfaceC}
              error={validateCelsius('Temperatura superficial', surfaceC)}
            />
            <SliderInput
              label="Temperatura ambiente"
              value={ambientC}
              min={-50}
              max={400}
              step={1}
              unit="C"
              onChange={setAmbientC}
              error={validateCelsius('Temperatura ambiente', ambientC)}
            />

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={saveActiveSimulation}
                disabled={errors.length > 0}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-violet-300/40 bg-violet-500/18 px-3 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-45"
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
              label="Radiacion neta"
              value={errors.length ? 'Revise' : formatNumber(q, 2)}
              unit={errors.length ? undefined : 'W'}
              tone="rad"
              interpretation={
                errors.length
                  ? 'Hay variables fuera del rango fisico permitido.'
                  : `La superficie intercambia ${formatNumber(Math.abs(q) / area, 2)} W/m2 netos.`
              }
            />
            <ResultCard
              label="Poder cuerpo negro"
              value={errors.length ? 'Revise' : formatNumber(result?.blackbodyPower ?? 0, 2)}
              unit={errors.length ? undefined : 'W/m2'}
              tone="warm"
              interpretation="Valor maximo teorico emitido por unidad de area a esa temperatura."
            />
            <ResultCard
              label="Emisividad"
              value={formatNumber(epsilon, 3)}
              tone="cold"
              interpretation={`${surface.name}: fraccion del comportamiento de un cuerpo negro ideal.`}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Q contra emisividad" subtitle="epsilon desde 0 hasta 1.0">
          <TemperatureProfileChart
            data={emissivityCurve}
            series={[{ dataKey: 'q', name: 'Q', color: '#a78bfa' }]}
            xLabel="Emisividad"
            yLabel="Q (W)"
          />
        </Card>
        <Card title="Cuerpo negro vs gris" subtitle="Curvas Q(T) para epsilon 1.0, 0.5 y 0.1">
          <TemperatureProfileChart
            data={temperatureCurve}
            series={[
              { dataKey: 'e1', name: 'epsilon 1.0', color: '#f97316' },
              { dataKey: 'e0_5', name: 'epsilon 0.5', color: '#38bdf8' },
              { dataKey: 'e0_1', name: 'epsilon 0.1', color: '#a78bfa' },
            ]}
            xLabel="Temperatura"
            yLabel="Q (W)"
          />
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Comparacion entre superficies" subtitle="Misma area y temperatura, distinta emisividad">
          <ComparisonBarChart data={comparisonData} dataKey="q" name="Q (W)" color="#a78bfa" />
        </Card>
        <Card title="Formula activa" subtitle={practice}>
          <FormulaDisplay
            title="Superficie gris"
            formula="Q_rad = epsilon * sigma * A * (T_superficie^4 - T_ambiente^4)"
            substituted={`Q = ${formatNumber(epsilon, 3)} * ${SIGMA.toExponential(3)} * ${formatNumber(
              area,
            )} * (${formatNumber(toKelvin(surfaceC), 2)}^4 - ${formatNumber(toKelvin(ambientC), 2)}^4) = ${
              errors.length ? 'entrada no valida' : `${formatNumber(q, 2)} W`
            }`}
            note="Todas las temperaturas se convierten internamente a Kelvin antes de elevar a la cuarta potencia."
          />
        </Card>
      </div>
    </div>
  );
}
