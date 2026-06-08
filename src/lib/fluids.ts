import type { Fluid } from '../types';

export const FLUIDS: Fluid[] = [
  { id: 'air', name: 'Aire', rho: 1.204, mu: 1.81e-5, k: 0.0257, Pr: 0.713 },
  { id: 'water', name: 'Agua', rho: 998.2, mu: 1.002e-3, k: 0.598, Pr: 7.01 },
  { id: 'oil', name: 'Aceite', rho: 870, mu: 0.08, k: 0.145, Pr: 1050 },
  { id: 'ethanol', name: 'Etanol', rho: 789, mu: 1.2e-3, k: 0.167, Pr: 16.5 },
  { id: 'glycerin', name: 'Glicerina', rho: 1261, mu: 1.412, k: 0.285, Pr: 12500 },
];

export const getFluid = (id: string): Fluid => FLUIDS.find((fluid) => fluid.id === id) ?? FLUIDS[0];
