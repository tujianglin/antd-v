import { presetPrimaryColors } from '@ant-design/colors';

import type { CSSProperties } from 'vue';
import type { DirectionType } from '../config-provider';
import type { CircleProps } from './Circle.vue';
import type { ProgressGradient, ProgressProps, StringGradients } from './progress.vue';
import { LineStrokeColorVar } from './style';

export function validProgress(progress?: number) {
  if (!progress || progress < 0) {
    return 0;
  }
  if (progress > 100) {
    return 100;
  }
  return progress;
}

export function getSuccessPercent({ success }: ProgressProps) {
  let percent: number | undefined;
  if (success && 'percent' in success) {
    percent = success.percent;
  }
  return percent;
}

export const getPercentage = ({ percent, success }: ProgressProps) => {
  const realSuccessPercent = validProgress(getSuccessPercent({ success } as ProgressProps));
  return [realSuccessPercent, validProgress(validProgress(percent) - realSuccessPercent)];
};

export const getStrokeColor = ({ success = {}, strokeColor }: Partial<CircleProps>): (string | Record<PropertyKey, string>)[] => {
  const { strokeColor: successColor } = success;
  return [successColor || presetPrimaryColors.green, strokeColor || null!];
};

export const getSize = (
  size: ProgressProps['size'],
  type: ProgressProps['type'] | 'step',
  extra?: {
    steps?: number;
    strokeWidth?: number;
  },
): [number, number] => {
  let width = -1;
  let height = -1;
  if (type === 'step') {
    const steps = extra!.steps!;
    const strokeWidth = extra!.strokeWidth!;
    if (typeof size === 'string' || typeof size === 'undefined') {
      width = size === 'small' ? 2 : 14;
      height = strokeWidth ?? 8;
    } else if (typeof size === 'number') {
      [width, height] = [size, size];
    } else {
      [width = 14, height = 8] = (Array.isArray(size) ? size : [size.width, size.height]) as [number, number];
    }

    width *= steps;
  } else if (type === 'line') {
    const strokeWidth = extra?.strokeWidth;
    if (typeof size === 'string' || typeof size === 'undefined') {
      height = strokeWidth || (size === 'small' ? 6 : 8);
    } else if (typeof size === 'number') {
      [width, height] = [size, size];
    } else {
      [width = -1, height = 8] = (Array.isArray(size) ? size : [size.width, size.height]) as [number, number];
    }
  } else if (type === 'circle' || type === 'dashboard') {
    if (typeof size === 'string' || typeof size === 'undefined') {
      [width, height] = size === 'small' ? [60, 60] : [120, 120];
    } else if (typeof size === 'number') {
      [width, height] = [size, size];
    } else if (Array.isArray(size)) {
      width = (size[0] ?? size[1] ?? 120) as number;
      height = (size[0] ?? size[1] ?? 120) as number;
    }
  }
  return [width, height];
};

/**
 * @example
 *   {
 *     "0%": "#afc163",
 *     "75%": "#009900",
 *     "50%": "green", // ====> '#afc163 0%, #66FF00 25%, #00CC00 50%, #009900 75%, #ffffff 100%'
 *     "25%": "#66FF00",
 *     "100%": "#ffffff"
 *   }
 */
export const sortGradient = (gradients: StringGradients) => {
  let tempArr: { key: number; value?: string }[] = [];
  Object.keys(gradients).forEach((key) => {
    const formattedKey = parseFloat(key.replace(/%/g, ''));
    if (!Number.isNaN(formattedKey)) {
      tempArr.push({ key: formattedKey, value: gradients[key] });
    }
  });
  tempArr = tempArr.sort((a, b) => a.key - b.key);
  return tempArr.map(({ key, value }) => `${value} ${key}%`).join(', ');
};

/**
 * Then this man came to realize the truth: Besides six pence, there is the moon. Besides bread and
 * butter, there is the bug. And... Besides women, there is the code.
 *
 * @example
 *   {
 *     "0%": "#afc163",
 *     "25%": "#66FF00",
 *     "50%": "#00CC00", // ====>  linear-gradient(to right, #afc163 0%, #66FF00 25%,
 *     "75%": "#009900", //        #00CC00 50%, #009900 75%, #ffffff 100%)
 *     "100%": "#ffffff"
 *   }
 */
export const handleGradient = (strokeColor: ProgressGradient, directionConfig?: DirectionType): CSSProperties => {
  const {
    from = presetPrimaryColors.blue,
    to = presetPrimaryColors.blue,
    direction = directionConfig === 'rtl' ? 'to left' : 'to right',
    ...rest
  } = strokeColor;
  if (Object.keys(rest).length !== 0) {
    const sortedGradients = sortGradient(rest as StringGradients);
    const background = `linear-gradient(${direction}, ${sortedGradients})`;
    return { background, [LineStrokeColorVar]: background };
  }
  const background = `linear-gradient(${direction}, ${from}, ${to})`;
  return { background, [LineStrokeColorVar]: background };
};
