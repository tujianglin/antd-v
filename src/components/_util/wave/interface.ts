import type { WaveProps } from '.';

export type ShowWaveEffect = (
  element: HTMLElement,
  info: {
    className: string;
    component?: WaveComponent;
    event: MouseEvent;
    hashId: string;
    colorSource?: WaveProps['colorSource'];
  },
) => void;

export type ShowWave = (event: MouseEvent) => void;

export type WaveComponent = 'Tag' | 'Button' | 'Checkbox' | 'Radio' | 'Switch' | 'Steps';
