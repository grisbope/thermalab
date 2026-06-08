export type Mechanism = 'conduction' | 'convection' | 'radiation';

export type ViewId = 'dashboard' | Mechanism | 'history';

export interface Material {
  id: string;
  name: string;
  k: number;
  category: string;
}

export interface Fluid {
  id: string;
  name: string;
  rho: number;
  mu: number;
  k: number;
  Pr: number;
}

export interface Surface {
  id: string;
  name: string;
  epsilon: number;
}

export interface ChartPoint {
  label: string;
  [key: string]: string | number;
}

export interface ResultValue {
  label: string;
  value: number | string;
  unit?: string;
}

export type SimulationValue = string | number | boolean | null;

export interface SavedSimulation {
  id: string;
  name: string;
  module: Mechanism;
  practice: string;
  timestamp: string;
  parameters: Record<string, SimulationValue>;
  results: Record<string, SimulationValue>;
}

export type NewSimulation = Omit<SavedSimulation, 'id' | 'timestamp'>;
