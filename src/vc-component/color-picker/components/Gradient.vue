<script lang="tsx" setup>
import { computed } from 'vue';
import { Color } from '../color';
import type { HsbaColorType } from '../interface';
import { generateColor } from '../util';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  colors,
  direction = 'to right',
  type,
  prefixCls,
} = defineProps<{
  colors: (Color | string)[];
  direction?: string;
  type?: HsbaColorType;
  prefixCls?: string;
}>();

const gradientColors = computed(() =>
  colors
    .map((color, idx) => {
      let result = generateColor(color);
      if (type === 'alpha' && idx === colors.length - 1) {
        result = new Color(result.setA(1));
      }
      return result.toRgbString();
    })
    .join(','),
);
</script>
<template>
  <div
    :class="`${prefixCls}-gradient`"
    :style="{
      position: 'absolute',
      inset: 0,
      background: `linear-gradient(${direction}, ${gradientColors})`,
    }"
  >
    <slot></slot>
  </div>
</template>
