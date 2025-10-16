import { Color as RcColor } from '@/vc-component/color-picker';

import type { ColorGenInput, Colors } from './interface';

export const toHexFormat = (value?: string, alpha?: boolean) => value?.replace(/[^\w/]/g, '').slice(0, alpha ? 8 : 6) || '';

export const getHex = (value?: string, alpha?: boolean) => (value ? toHexFormat(value, alpha) : '');

export type GradientColor = {
  color: AggregationColor;
  percent: number;
}[];

export class AggregationColor {
  /** Original Color object */
  private metaColor: RcColor;

  private colors: GradientColor | undefined;

  public cleared = false;

  constructor(color: ColorGenInput<AggregationColor> | Colors<AggregationColor>) {
    // Clone from another AggregationColor
    if (color instanceof AggregationColor) {
      this.metaColor = color.metaColor.clone();
      this.colors = color.colors?.map((info) => ({
        color: new AggregationColor(info.color),
        percent: info.percent,
      }));
      this.cleared = color.cleared;
      return;
    }

    const isArray = Array.isArray(color);

    if (isArray && color.length) {
      this.colors = color.map(({ color: c, percent }) => ({
        color: new AggregationColor(c),
        percent,
      }));
      this.metaColor = new RcColor(this.colors[0].color.metaColor);
    } else {
      this.metaColor = new RcColor(isArray ? '' : color);
    }

    if (!color || (isArray && !this.colors)) {
      this.metaColor = this.metaColor.setA(0);
      this.cleared = true;
    }
  }

  toHsb() {
    return this.metaColor.toHsb();
  }

  toHsbString() {
    return this.metaColor.toHsbString();
  }

  toHex() {
    return getHex(this.toHexString(), this.metaColor.a < 1);
  }

  toHexString() {
    return this.metaColor.toHexString();
  }

  toRgb() {
    return this.metaColor.toRgb();
  }

  toRgbString() {
    return this.metaColor.toRgbString();
  }

  isGradient(): boolean {
    return !!this.colors && !this.cleared;
  }

  getColors(): GradientColor {
    return this.colors || [{ color: this, percent: 0 }];
  }

  toCssString(): string {
    const { colors } = this;

    // CSS line-gradient
    if (colors) {
      const colorsStr = colors.map((c) => `${c.color.toRgbString()} ${c.percent}%`).join(', ');
      return `linear-gradient(90deg, ${colorsStr})`;
    }

    return this.metaColor.toRgbString();
  }

  equals(color: AggregationColor | null): boolean {
    if (!color || this.isGradient() !== color.isGradient()) {
      return false;
    }

    if (!this.isGradient()) {
      return this.toHexString() === color.toHexString();
    }

    return (
      this.colors!.length === color.colors!.length &&
      this.colors!.every((c, i) => {
        const target = color.colors![i];
        return c.percent === target.percent && c.color.equals(target.color);
      })
    );
  }

  static parseGradient(cssString: string): GradientColor | null {
    if (!cssString || !cssString.startsWith('linear-gradient')) {
      return null;
    }

    // 提取颜色部分（去掉方向角度）
    const inner = cssString.replace(/^linear-gradient\([^,]+,\s*(.*)\)$/, '$1');

    // 按逗号分割成每个颜色片段
    const colorStops = inner.split(/,(?![^(]*\))/).map((s) => s.trim());

    const gradient: GradientColor = colorStops.map((stop) => {
      // 提取颜色（支持 rgb/rgba/hex）
      const colorMatch = stop.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})/);
      // 提取百分比
      const percentMatch = stop.match(/(\d+(?:\.\d+)?)%/);

      const colorStr = colorMatch ? colorMatch[1] : '#000';
      const percent = percentMatch ? parseFloat(percentMatch[1]) : 0;

      return {
        color: new AggregationColor(colorStr),
        percent,
      };
    });

    return gradient;
  }

  fromCssString(cssString: string) {
    const gradient = AggregationColor.parseGradient(cssString);
    if (gradient) {
      this.colors = gradient;
      this.cleared = false;
      this.metaColor = gradient[0].color.metaColor.clone();
    }
    return this;
  }
}
