import { useEffect, useMemo, useState } from 'react';
import { Box, Layers, Save } from 'lucide-react';
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
  calculateFlatConduction,
  calculateMultilayerConduction,
  formatNumber,
  validateCelsius,
  validatePositive,
  type Layer,
} from '../../lib/calculations';
import { getMaterial, MATERIALS } from '../../lib/materials';
import type { NewSimulation, SavedSimulation, SimulationValue } from '../../types';
import { FLAT_PRACTICE } from './PracticeFlat';
import { MULTILAYER_PRACTICE } from './PracticeMultilayer';

interface ConductionModuleProps {
  loadedSimulation: SavedSimulation | null;
  onLoaded: () => void;
  onSave: (simulation: NewSimulation) => void;
}

type Mode = 'flat' | 'multilayer';

const comparisonIds = ['copper', 'brick', 'fiberglass', 'polyurethane'];

const selectClass =
  'h-11 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm font-semibold text-slate-100';

const numberFrom = (value: SimulationValue | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const stringFrom = (value: SimulationValue | undefined, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

export function ConductionModule({ loadedSimulation, onLoaded, onSave }: ConductionModuleProps) {
  const [mode, setMode] = useState<Mode>('flat');
  const [practice, setPractice] = useState(FLAT_PRACTICE.name);
  const [simulationName, setSimulationName] = useState('Conduccion - pared plana');
  const [materialId, setMaterialId] = useState(FLAT_PRACTICE.materialId);
  const [length, setLength] = useState(FLAT_PRACTICE.length);
  const [area, setArea] = useState(FLAT_PRACTICE.area);
  const [hotC, setHotC] = useState(FLAT_PRACTICE.hotC);
  const [coldC, setColdC] = useState(FLAT_PRACTICE.coldC);
  const [layers, setLayers] = useState<Layer[]>(MULTILAYER_PRACTICE.layers);

  useEffect(() => {
    if (loadedSimulation?.module !== 'conduction') return;
    const loadedMode = stringFrom(loadedSimulation.parameters.mode, 'flat') === 'multilayer' ? 'multilayer' : 'flat';
    setMode(loadedMode);
    setPractice(loadedSimulation.practice);
    setSimulationName(loadedSimulation.name);
    setMaterialId(stringFrom(loadedSimulation.parameters.materialId, FLAT_PRACTICE.materialId));
    setLength(numberFrom(loadedSimulation.parameters.length, FLAT_PRACTICE.length));
    setArea(numberFrom(loadedSimulation.parameters.area, FLAT_PRACTICE.area));
    setHotC(numberFrom(loadedSimulation.parameters.hotC, FLAT_PRACTICE.hotC));
    setColdC(numberFrom(loadedSimulation.parameters.coldC, FLAT_PRACTICE.coldC));
    setLayers((current) =>
      current.map((layer, index) => ({
        ...layer,
        L: numberFrom(loadedSimulation.parameters[`layer${index + 1}L`], layer.L),
      })),
    );
    onLoaded();
  }, [loadedSimulation, onLoaded]);

  const material = getMaterial(materialId);
  const errors = [
    validatePositive('Area', area),
    validatePositive('Espesor', length),
    validatePositive('Conductividad', material.k),
    validateCelsius('Temperatura caliente', hotC),
    validateCelsius('Temperatura fria', coldC),
    ...layers.map((layer) => validatePositive(`Espesor ${layer.name}`, layer.L)),
  ].filter((message): message is string => Boolean(message));

  const flatResult = useMemo(
    () => (errors.length === 0 ? calculateFlatConduction(material.k, area, length, hotC, coldC) : null),
    [area, coldC, errors.length, hotC, length, material.k],
  );

  const referenceQ = useMemo(
    () => (errors.length === 0 ? calculateFlatConduction(0.72, area, 0.2, hotC, coldC).q : 0),
    [area, coldC, errors.length, hotC],
  );

  const multilayerResult = useMemo(
    () => (errors.length === 0 ? calculateMultilayerConduction(layers, area, hotC, coldC, referenceQ) : null),
    [area, coldC, errors.length, hotC, layers, referenceQ],
  );

  const activeResult = mode === 'flat' ? flatResult : multilayerResult;
  const qValue = activeResult?.q ?? 0;

  const comparisonData = useMemo(() => {
    if (errors.length > 0) return [];
    return comparisonIds.map((id) => {
      const item = getMaterial(id);
      return {
        label: item.name,
        q: calculateFlatConduction(item.k, area, length, hotC, coldC).q,
      };
    });
  }, [area, coldC, errors.length, hotC, length]);

  const loadFlatPractice = () => {
    setMode('flat');
    setPractice(FLAT_PRACTICE.name);
    setSimulationName('Conduccion - pared de ladrillo');
    setMaterialId(FLAT_PRACTICE.materialId);
    setLength(FLAT_PRACTICE.length);
    setArea(FLAT_PRACTICE.area);
    setHotC(FLAT_PRACTICE.hotC);
    setColdC(FLAT_PRACTICE.coldC);
  };

  const loadMultilayerPractice = () => {
    setMode('multilayer');
    setPractice(MULTILAYER_PRACTICE.name);
    setSimulationName('Conduccion - aislamiento multicapa');
    setArea(MULTILAYER_PRACTICE.area);
    setHotC(MULTILAYER_PRACTICE.hotC);
    setColdC(MULTILAYER_PRACTICE.coldC);
    setLayers(MULTILAYER_PRACTICE.layers);
  };

  const updateLayerLength = (index: number, value: number) => {
    setLayers((current) => current.map((layer, layerIndex) => (layerIndex === index ? { ...layer, L: value } : layer)));
  };

  const exportData = {
    name: simulationName,
    module: 'conduction',
    practice,
    parameters: {
      mode,
      materialId,
      k: material.k,
      length,
      area,
      hotC,
      coldC,
      layer1L: layers[0]?.L ?? null,
      layer2L: layers[1]?.L ?? null,
      layer3L: layers[2]?.L ?? null,
    },
    results: {
      q: qValue,
      resistance: mode === 'flat' ? flatResult?.resistance ?? null : multilayerResult?.totalResistance ?? null,
      efficiency: mode === 'multilayer' ? multilayerResult?.efficiency ?? null : null,
    },
  };

  const saveActiveSimulation = () => {
    onSave({
      name: simulationName.trim() || 'Simulacion de conduccion',
      module: 'conduction',
      practice,
      parameters: exportData.parameters,
      results: exportData.results,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Badge tone="warm">Ley de Fourier</Badge>
          <h2 className="mt-3 text-2xl font-black text-slate-50">Modulo de conduccion</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Estudia transferencia unidimensional, resistencia termica y efecto de aislamiento con datos en SI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadFlatPractice}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-orange-300/40 bg-orange-400/12 px-3 py-2 text-sm font-semibold text-orange-100"
          >
            <Box size={16} aria-hidden="true" />
            P1 pared
          </button>
          <button
            type="button"
            onClick={loadMultilayerPractice}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-cyan-300/40 bg-cyan-400/12 px-3 py-2 text-sm font-semibold text-cyan-100"
          >
            <Layers size={16} aria-hidden="true" />
            P2 multicapa
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

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('flat')}
                className={`min-h-10 rounded-md px-3 text-sm font-bold ${
                  mode === 'flat'
                    ? 'bg-orange-400/20 text-orange-100 ring-1 ring-orange-300/50'
                    : 'bg-slate-800/70 text-slate-300'
                }`}
              >
                Pared simple
              </button>
              <button
                type="button"
                onClick={() => setMode('multilayer')}
                className={`min-h-10 rounded-md px-3 text-sm font-bold ${
                  mode === 'multilayer'
                    ? 'bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-300/50'
                    : 'bg-slate-800/70 text-slate-300'
                }`}
              >
                Multicapa
              </button>
            </div>

            {mode === 'flat' && (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">
                    Material
                  </span>
                  <select className={selectClass} value={materialId} onChange={(event) => setMaterialId(event.target.value)}>
                    {MATERIALS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - k={item.k} W/m K
                      </option>
                    ))}
                  </select>
                </label>
                <SliderInput
                  label="Espesor L"
                  value={length}
                  min={0.005}
                  max={1}
                  step={0.005}
                  unit="m"
                  onChange={setLength}
                  error={validatePositive('Espesor', length)}
                />
              </>
            )}

            {mode === 'multilayer' && (
              <div className="space-y-3 rounded-lg border border-slate-700/70 p-3">
                <p className="text-sm font-bold text-slate-100">Capas en serie</p>
                {layers.map((layer, index) => (
                  <SliderInput
                    key={layer.name}
                    label={`${layer.name} (k=${layer.k} W/m K)`}
                    value={layer.L}
                    min={0.005}
                    max={0.3}
                    step={0.005}
                    unit="m"
                    onChange={(value) => updateLayerLength(index, value)}
                    error={validatePositive(`Espesor ${layer.name}`, layer.L)}
                  />
                ))}
              </div>
            )}

            <SliderInput
              label="Area A"
              value={area}
              min={0.01}
              max={30}
              step={0.01}
              unit="m2"
              onChange={setArea}
              error={validatePositive('Area', area)}
            />
            <SliderInput
              label="Temperatura caliente"
              value={hotC}
              min={-50}
              max={500}
              step={1}
              unit="C"
              onChange={setHotC}
              error={validateCelsius('Temperatura caliente', hotC)}
            />
            <SliderInput
              label="Temperatura fria"
              value={coldC}
              min={-50}
              max={300}
              step={1}
              unit="C"
              onChange={setColdC}
              error={validateCelsius('Temperatura fria', coldC)}
            />

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={saveActiveSimulation}
                disabled={errors.length > 0}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-orange-300/40 bg-orange-500/18 px-3 py-2 text-sm font-semibold text-orange-100 transition hover:bg-orange-500/25 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Save size={16} aria-hidden="true" />
                Guardar
              </button>
              <ExportButton filename="thermalab-conduccion.json" data={exportData} />
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <ThermalDiagram
            type="conduction"
            conduction={{
              hotC,
              coldC,
              q: errors.length ? 0 : qValue,
              length: mode === 'flat' ? length : layers.reduce((total, layer) => total + layer.L, 0),
              layers: mode === 'multilayer' ? layers : undefined,
            }}
          />
          <div className={`grid gap-4 ${mode === 'multilayer' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            <ResultCard
              label="Transferencia de calor"
              value={errors.length ? 'Revise' : formatNumber(qValue, 2)}
              unit={errors.length ? undefined : 'W'}
              tone="warm"
              interpretation={
                errors.length
                  ? 'Hay variables fuera del rango fisico permitido.'
                  : `Equivale a ${formatNumber(Math.abs(qValue) / 1000, 3)} kW de potencia termica.`
              }
            />
            <ResultCard
              label="Resistencia termica"
              value={
                errors.length
                  ? 'Revise'
                  : formatNumber(mode === 'flat' ? flatResult?.resistance ?? 0 : multilayerResult?.totalResistance ?? 0, 4)
              }
              unit={errors.length ? undefined : 'K/W'}
              tone="cold"
              interpretation="Mayor resistencia implica menor transferencia para el mismo gradiente."
            />
            {mode === 'multilayer' && (
              <ResultCard
                label="Aislamiento"
                value={multilayerResult ? formatNumber(multilayerResult.efficiency, 2) : 'Revise'}
                unit={multilayerResult ? '%' : undefined}
                tone="rad"
                interpretation="Reduccion de Q respecto a la pared de ladrillo sin aislante."
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Perfil de temperatura" subtitle="T(x) lineal por resistencia termica">
          <TemperatureProfileChart
            data={(mode === 'flat' ? flatResult?.profile : multilayerResult?.profile) ?? []}
            series={[{ dataKey: 'temperatura', name: 'Temperatura', color: '#f97316' }]}
            xLabel="Posicion x (m)"
            yLabel="Temperatura (C)"
          />
        </Card>
        <Card title="Comparacion entre materiales" subtitle="Misma geometria, diferente conductividad k">
          <ComparisonBarChart data={comparisonData} dataKey="q" name="Q (W)" color="#38bdf8" />
        </Card>
      </div>

      <Card title="Formula activa" subtitle={mode === 'flat' ? FLAT_PRACTICE.objective : MULTILAYER_PRACTICE.objective}>
        {mode === 'flat' ? (
          <FormulaDisplay
            title="Pared plana simple"
            formula="Q = (k * A * (T_caliente - T_fria)) / L"
            substituted={`Q = (${formatNumber(material.k)} * ${formatNumber(area)} * (${formatNumber(hotC)} - ${formatNumber(
              coldC,
            )})) / ${formatNumber(length)} = ${errors.length ? 'entrada no valida' : `${formatNumber(qValue, 2)} W`}`}
            note="Con los valores de la practica P1, la formula produce 432 W; 43.2 W requeriria A=1 m2 o un delta T diez veces menor."
          />
        ) : (
          <FormulaDisplay
            title="Pared multicapa"
            formula="R_total = suma(L_i / (k_i * A)); Q = (T_caliente - T_fria) / R_total"
            substituted={`R_total = ${formatNumber(multilayerResult?.totalResistance ?? 0, 4)} K/W; Q = (${formatNumber(
              hotC,
            )} - ${formatNumber(coldC)}) / R_total = ${
              errors.length ? 'entrada no valida' : `${formatNumber(qValue, 2)} W`
            }`}
            note="Las capas estan en serie, por eso las resistencias termicas se suman."
          />
        )}
      </Card>
    </div>
  );
}
