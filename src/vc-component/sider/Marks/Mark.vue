<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties } from 'vue';
import { useSliderContextInject } from '../context';
import { getDirectionStyle } from '../util';

export interface MarkProps {
  prefixCls: string;
  style?: CSSProperties;
  value: number;
  onClick: (value: number) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, style, value, onClick } = defineProps<MarkProps>();
const { min, max, direction, includedStart, includedEnd, included } = toRefs(useSliderContextInject());

const textCls = `${prefixCls}-text`;

// ============================ Offset ============================
const positionStyle = computed(() => getDirectionStyle(direction.value, value, min.value, max.value));
</script>
<template>
  <span
    :class="
      clsx(textCls, {
        [`${textCls}-active`]: included && includedStart <= value && value <= includedEnd,
      })
    "
    :style="{ ...positionStyle, ...style }"
    @mousedown="(e) => e.stopPropagation()"
    @click="
      () => {
        onClick?.(value);
      }
    "
  >
    <slot></slot>
  </span>
</template>
