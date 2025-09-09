import clsx from 'clsx';
import type { CSSProperties } from 'vue';
import { isPresetColor } from '../_util/colors';
import type { ColorGenInput } from '../color-picker/interface';
import { generateColor } from '../color-picker/util';

export function parseColor(prefixCls: string, color?: string) {
  const isInternalColor = isPresetColor(color);

  const className = clsx({
    [`${prefixCls}-${color}`]: color && isInternalColor,
  });

  const overlayStyle: CSSProperties = {};
  const arrowStyle: CSSProperties = {};
  const rgb = generateColor(color as ColorGenInput).toRgb();
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const textColor = luminance < 0.5 ? '#FFF' : '#000';
  if (color && !isInternalColor) {
    overlayStyle.background = color;
    overlayStyle['--ant-tooltip-color'] = textColor;
    arrowStyle['--antd-arrow-background-color'] = color;
  }

  return { className, overlayStyle, arrowStyle };
}
