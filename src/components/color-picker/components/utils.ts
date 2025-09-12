import { Color as RcColor } from '@/vc-component/color-picker';
import type { AggregationColor } from '../color';

export const isBright = (value: AggregationColor, bgColorToken: string) => {
  const { r, g, b, a } = value.toRgb();
  const hsv = new RcColor(value.toRgbString()).onBackground(bgColorToken).toHsv();
  if (a <= 0.5) {
    // Adapted to dark mode
    return hsv.v > 0.5;
  }
  return r * 0.299 + g * 0.587 + b * 0.114 > 192;
};
