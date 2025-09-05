<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties } from 'vue';
import { useSliderContextInject } from '../context';
import { getDirectionStyle } from '../util';

export interface DotProps {
  prefixCls: string;
  value: number;
  style?: CSSProperties | ((dotValue: number) => CSSProperties);
  activeStyle?: CSSProperties | ((dotValue: number) => CSSProperties);
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, value, style, activeStyle } = defineProps<DotProps>();

const { min, max, direction, included, includedStart, includedEnd } = toRefs(useSliderContextInject());

const dotClassName = `${prefixCls}-dot`;
const active = computed(() => included.value && includedStart.value <= value && value <= includedEnd.value);

// ============================ Offset ============================
const mergedStyle = computed<CSSProperties>(() => {
  let result: CSSProperties = {
    ...getDirectionStyle(direction.value, value, min.value, max.value),
    ...(typeof style === 'function' ? style(value) : style),
  };

  if (active.value) {
    result = {
      ...result,
      ...(typeof activeStyle === 'function' ? activeStyle(value) : activeStyle),
    };
  }
  return result;
});
</script>
<template>
  <span :class="clsx(dotClassName, { [`${dotClassName}-active`]: active })" :style="mergedStyle"></span>
</template>
