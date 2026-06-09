import { Flame, History, Home, ThermometerSun, Waves } from 'lucide-react';
import type { ViewId } from '../../types';

export const NAV_ITEMS: Array<{
  id: ViewId;
  label: string;
  icon: typeof Home;
}> = [
  { id: 'dashboard', label: 'Panel', icon: Home },
  { id: 'conduction', label: 'Conducción', icon: Flame },
  { id: 'convection', label: 'Convección', icon: Waves },
  { id: 'radiation', label: 'Radiación', icon: ThermometerSun },
  { id: 'history', label: 'Historial', icon: History },
];
