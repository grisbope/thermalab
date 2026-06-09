import type { Material } from '../types';

export const MATERIALS: Material[] = [
  { id: 'copper', name: 'Cobre', k: 401, category: 'metal' },
  { id: 'aluminum', name: 'Aluminio', k: 237, category: 'metal' },
  { id: 'steel', name: 'Acero inoxidable', k: 16, category: 'metal' },
  { id: 'concrete', name: 'Hormigón', k: 1.4, category: 'construccion' },
  { id: 'brick', name: 'Ladrillo', k: 0.72, category: 'construccion' },
  { id: 'glass', name: 'Vidrio', k: 1.05, category: 'construccion' },
  { id: 'wood_oak', name: 'Madera (roble)', k: 0.17, category: 'organico' },
  { id: 'fiberglass', name: 'Fibra de vidrio', k: 0.038, category: 'aislante' },
  { id: 'rockwool', name: 'Lana de roca', k: 0.035, category: 'aislante' },
  { id: 'polyurethane', name: 'Poliuretano', k: 0.026, category: 'aislante' },
  { id: 'air', name: 'Aire (estático)', k: 0.026, category: 'gas' },
];

export const getMaterial = (id: string): Material =>
  MATERIALS.find((material) => material.id === id) ?? MATERIALS[0];
