import { defaultPrefixCls } from '@/components/config-provider/context';
import type { GlobalToken } from '@/components/theme/internal';
import type { WaveProps } from '.';

export const TARGET_CLS = `${defaultPrefixCls}-wave-target`;

export type ShowWaveEffect = (
  element: HTMLElement,
  info: {
    className: string;
    token: GlobalToken;
    component?: WaveComponent;
    event: MouseEvent;
    hashId: string;
    colorSource?: WaveProps['colorSource'];
  },
) => void;

export type ShowWave = (event: MouseEvent) => void;

export type WaveComponent = 'Tag' | 'Button' | 'Checkbox' | 'Radio' | 'Switch' | 'Steps';
