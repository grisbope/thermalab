import type { Layer } from '../../lib/calculations';

export const MULTILAYER_PRACTICE = {
  name: 'P2 Aislamiento multicapa',
  objective: 'Comparar una pared sin aislamiento contra una pared con lana de roca.',
  area: 10,
  hotC: 30,
  coldC: 18,
  layers: [
    { name: 'Ladrillo', k: 0.72, L: 0.2 },
    { name: 'Lana de roca', k: 0.035, L: 0.05 },
    { name: 'Yeso', k: 0.43, L: 0.01 },
  ] satisfies Layer[],
};
