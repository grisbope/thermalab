import type { ChartPoint, Fluid } from '../types';

export const SIGMA = 5.670374419e-8;
export const ABSOLUTE_ZERO_C = -273.15;

export interface Layer {
  name: string;
  k: number;
  L: number;
}

export interface FlatConductionResult {
  q: number;
  resistance: number;
  heatFlux: number;
  profile: ChartPoint[];
}

export interface MultilayerConductionResult {
  q: number;
  totalResistance: number;
  efficiency: number;
  profile: ChartPoint[];
}

export interface ForcedConvectionResult {
  q: number;
  re: number;
  nu: number;
  h: number;
  regime: 'Laminar' | 'Transicion' | 'Turbulento';
  validity: string;
}

export interface NaturalConvectionResult {
  q: number;
  ra: number;
  nu: number;
  h: number;
  validity: string;
}

export interface RadiationResult {
  q: number;
  blackbodyPower: number;
}

export const toKelvin = (temperatureC: number): number => temperatureC + 273.15;

export const formatNumber = (value: number, digits = 3): string => {
  if (!Number.isFinite(value)) return '0';
  if (Math.abs(value) >= 10000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) {
    return value.toExponential(2);
  }
  return new Intl.NumberFormat('es-EC', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
};

export const validatePositive = (label: string, value: number): string | null =>
  value > 0 ? null : `${label} debe ser mayor que cero.`;

export const validateNonNegative = (label: string, value: number): string | null =>
  value >= 0 ? null : `${label} no puede ser negativo.`;

export const validateCelsius = (label: string, value: number): string | null =>
  value >= ABSOLUTE_ZERO_C ? null : `${label} no puede ser menor que -273.15 C.`;

export const validateEmissivity = (value: number): string | null =>
  value >= 0 && value <= 1 ? null : 'La emisividad debe estar entre 0 y 1.';

export const calculateFlatConduction = (
  k: number,
  area: number,
  length: number,
  hotC: number,
  coldC: number,
): FlatConductionResult => {
  const deltaT = hotC - coldC;
  const resistance = length / (k * area);
  const q = (k * area * deltaT) / length;
  const heatFlux = q / area;
  const profile = Array.from({ length: 21 }, (_, index) => {
    const x = (length * index) / 20;
    const temperature = hotC - deltaT * (x / length);
    return { label: x.toFixed(3), temperatura: temperature, x };
  });

  return { q, resistance, heatFlux, profile };
};

export const calculateMultilayerConduction = (
  layers: Layer[],
  area: number,
  hotC: number,
  coldC: number,
  referenceQ: number,
): MultilayerConductionResult => {
  const totalResistance = layers.reduce((total, layer) => total + layer.L / (layer.k * area), 0);
  const q = (hotC - coldC) / totalResistance;
  const totalLength = layers.reduce((total, layer) => total + layer.L, 0);
  const profile: ChartPoint[] = [{ label: '0.000', temperatura: hotC, x: 0 }];
  let position = 0;
  let temperature = hotC;

  layers.forEach((layer) => {
    const drop = q * (layer.L / (layer.k * area));
    position += layer.L;
    temperature -= drop;
    profile.push({
      label: position.toFixed(3),
      temperatura: temperature,
      x: position,
      capa: layer.name,
      fraccion: position / totalLength,
    });
  });

  const efficiency = referenceQ === 0 ? 0 : (1 - q / referenceQ) * 100;
  return { q, totalResistance, efficiency, profile };
};

export const reynoldsRegime = (re: number): ForcedConvectionResult['regime'] => {
  if (re < 5e5) return 'Laminar';
  if (re < 1e7) return 'Transicion';
  return 'Turbulento';
};

export const calculateForcedConvection = (
  fluid: Fluid,
  velocity: number,
  length: number,
  area: number,
  surfaceC: number,
  fluidC: number,
): ForcedConvectionResult => {
  const re = (fluid.rho * velocity * length) / fluid.mu;
  const regime = reynoldsRegime(re);
  const nu =
    re < 5e5
      ? 0.664 * Math.pow(re, 0.5) * Math.pow(fluid.Pr, 1 / 3)
      : 0.037 * Math.pow(re, 0.8) * Math.pow(fluid.Pr, 1 / 3);
  const h = (nu * fluid.k) / length;
  const q = h * area * (surfaceC - fluidC);
  const validity =
    regime === 'Laminar'
      ? 'Correlacion laminar valida para Re < 5e5.'
      : 'Correlacion turbulenta usada para comparacion; revisar rango experimental si Re esta en transicion.';

  return { q, re, nu, h, regime, validity };
};

export const calculateNaturalConvectionAir = (
  air: Fluid,
  length: number,
  area: number,
  surfaceC: number,
  fluidC: number,
): NaturalConvectionResult => {
  const cpAir = 1005;
  const filmK = toKelvin((surfaceC + fluidC) / 2);
  const beta = 1 / filmK;
  const nuKinematic = air.mu / air.rho;
  const alpha = air.k / (air.rho * cpAir);
  const deltaT = surfaceC - fluidC;
  const ra = (9.81 * beta * Math.abs(deltaT) * Math.pow(length, 3)) / (nuKinematic * alpha);
  const nu = 0.59 * Math.pow(ra, 0.25);
  const h = (nu * air.k) / length;
  const q = h * area * deltaT;
  const validity =
    ra >= 1e4 && ra <= 1e9
      ? 'Correlacion natural valida para 1e4 < Ra < 1e9.'
      : 'Ra fuera del rango recomendado 1e4 a 1e9; resultado orientativo.';

  return { q, ra, nu, h, validity };
};

export const generateCoolingProfile = (
  initialC: number,
  fluidC: number,
  h: number,
  area: number,
  durationSeconds = 600,
): ChartPoint[] => {
  const steelDensity = 7850;
  const steelCp = 500;
  const thickness = 0.005;
  const mass = steelDensity * area * thickness;
  const capacitance = Math.max(mass * steelCp, 1);

  return Array.from({ length: 21 }, (_, index) => {
    const time = (durationSeconds * index) / 20;
    const temperature = fluidC + (initialC - fluidC) * Math.exp((-h * area * time) / capacitance);
    return { label: `${Math.round(time)} s`, temperatura: temperature, tiempo: time };
  });
};

export const calculateRadiation = (
  epsilon: number,
  area: number,
  surfaceC: number,
  ambientC: number,
): RadiationResult => {
  const surfaceK = toKelvin(surfaceC);
  const ambientK = toKelvin(ambientC);
  const blackbodyPower = SIGMA * Math.pow(surfaceK, 4);
  const q = epsilon * SIGMA * area * (Math.pow(surfaceK, 4) - Math.pow(ambientK, 4));
  return { q, blackbodyPower };
};

export const generateRadiationTemperatureCurve = (
  ambientC: number,
  area: number,
  emissivities: number[],
  minC = 100,
  maxC = 500,
): ChartPoint[] => {
  return Array.from({ length: 17 }, (_, index) => {
    const temperature = minC + ((maxC - minC) * index) / 16;
    const point: ChartPoint = { label: `${Math.round(temperature)} C`, temperatura: temperature };
    emissivities.forEach((epsilon) => {
      point[`e${String(epsilon).replace('.', '_')}`] = calculateRadiation(
        epsilon,
        area,
        temperature,
        ambientC,
      ).q;
    });
    return point;
  });
};

export const generateEmissivityCurve = (
  area: number,
  surfaceC: number,
  ambientC: number,
): ChartPoint[] =>
  Array.from({ length: 11 }, (_, index) => {
    const epsilon = index / 10;
    return {
      label: epsilon.toFixed(1),
      emisividad: epsilon,
      q: calculateRadiation(epsilon, area, surfaceC, ambientC).q,
    };
  });
