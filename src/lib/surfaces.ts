import type { Surface } from '../types';

export const SURFACES: Surface[] = [
  { id: 'blackbody', name: 'Cuerpo negro (ideal)', epsilon: 1.0 },
  { id: 'black_paint', name: 'Pintura negra mate', epsilon: 0.97 },
  { id: 'human_skin', name: 'Piel humana', epsilon: 0.95 },
  { id: 'concrete', name: 'Hormigon', epsilon: 0.92 },
  { id: 'red_brick', name: 'Ladrillo rojo', epsilon: 0.9 },
  { id: 'oxidized_steel', name: 'Acero oxidado', epsilon: 0.79 },
  { id: 'polished_steel', name: 'Acero pulido', epsilon: 0.074 },
  { id: 'polished_aluminum', name: 'Aluminio pulido', epsilon: 0.039 },
  { id: 'polished_copper', name: 'Cobre pulido', epsilon: 0.023 },
  { id: 'white_paint', name: 'Pintura blanca', epsilon: 0.9 },
  { id: 'gold_foil', name: 'Papel de oro', epsilon: 0.02 },
];

export const getSurface = (id: string): Surface =>
  SURFACES.find((surface) => surface.id === id) ?? SURFACES[0];
