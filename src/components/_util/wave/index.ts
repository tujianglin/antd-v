import Ware from './index.vue';
import type { WaveComponent } from './interface';

export interface WaveProps {
  disabled?: boolean;
  component?: WaveComponent;
  colorSource?: 'color' | 'backgroundColor' | 'borderColor' | null;
}

export default Ware;
