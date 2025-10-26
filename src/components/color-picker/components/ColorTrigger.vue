<script lang="tsx" setup>
import { computed, type CSSProperties } from 'vue';
import { useLocale } from '../../locale';
import type { AggregationColor } from '../color';
import type { ColorFormatType, ColorPickerProps } from '../interface';
import { getColorAlpha } from '../util';
import ColorClear from './ColorClear.vue';
import clsx from 'clsx';
import Render from '@/vc-component/render';
import pickAttrs from '@/vc-util/pickAttrs';
import { ColorBlock } from '@/vc-component/color-picker';

export interface ColorTriggerProps {
  prefixCls: string;
  disabled?: boolean;
  format?: ColorFormatType;
  color: AggregationColor;
  open?: boolean;
  showText?: ColorPickerProps['showText'];
  class?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent) => void;
  onMouseenter?: (e: MouseEvent) => void;
  onMouseleave?: (e: MouseEvent) => void;
  activeIndex: number;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  color,
  prefixCls,
  open,
  disabled,
  format,
  class: className,
  showText,
  activeIndex,
  ...rest
} = defineProps<ColorTriggerProps>();

const colorTriggerPrefixCls = computed(() => `${prefixCls}-trigger`);
const colorTextPrefixCls = computed(() => `${colorTriggerPrefixCls.value}-text`);
const colorTextCellPrefixCls = computed(() => `${colorTextPrefixCls.value}-cell`);

const [locale] = useLocale('ColorPicker');

// ============================== Text ==============================
const desc = computed(() => {
  if (!showText) {
    return '';
  }

  if (typeof showText === 'function') {
    return showText(color);
  }

  if (color.cleared) {
    return locale.value.transparent;
  }

  if (color.isGradient()) {
    return color.getColors().map((c, index) => {
      const inactive = activeIndex !== -1 && activeIndex !== index;

      return (
        <span key={index} class={clsx(colorTextCellPrefixCls.value, inactive && `${colorTextCellPrefixCls.value}-inactive`)}>
          {c.color.toRgbString()} {c.percent}%
        </span>
      );
    });
  }

  const hexString = color.toHexString().toUpperCase();
  const alpha = getColorAlpha(color);
  switch (format) {
    case 'rgb':
      return color.toRgbString();
    case 'hsb':
      return color.toHsbString();
    // case 'hex':
    default:
      return alpha < 100 ? `${hexString.slice(0, 7)},${alpha}%` : hexString;
  }
});
</script>
<template>
  <div
    :class="
      clsx(colorTriggerPrefixCls, className, {
        [`${colorTriggerPrefixCls}-active`]: open,
        [`${colorTriggerPrefixCls}-disabled`]: disabled,
      })
    "
    v-bind="{ ...pickAttrs(rest), ...$attrs }"
  >
    <ColorClear v-if="color.cleared" :prefix-cls="prefixCls" />
    <ColorBlock v-else :prefix-cls="prefixCls" :color="color.toCssString()" />
    <div v-if="showText" :class="colorTextPrefixCls">
      <Render :content="desc" />
    </div>
  </div>
</template>
