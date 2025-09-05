<script lang="tsx" setup>
import { computed, toRefs, type CSSProperties } from 'vue';
import type { InternalMarkObj } from '../Marks/index.vue';
import { useSliderContextInject } from '../context';
import Dot from './Dot.vue';

export interface StepsProps {
  prefixCls: string;
  marks: InternalMarkObj[];
  dots?: boolean;
  style?: CSSProperties | ((dotValue: number) => CSSProperties);
  activeStyle?: CSSProperties | ((dotValue: number) => CSSProperties);
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, marks, dots, style, activeStyle } = defineProps<StepsProps>();
const { min, max, step } = toRefs(useSliderContextInject());

const stepDots = computed<number[]>(() => {
  const dotSet = new Set<number>();

  // Add marks
  marks.forEach((mark) => {
    dotSet.add(mark.value);
  });

  // Fill dots
  if (dots && step.value !== null) {
    let current = min.value;
    while (current <= max.value) {
      dotSet.add(current);
      current += step.value;
    }
  }

  return Array.from(dotSet);
});
</script>
<template>
  <div :class="`${prefixCls}-step`">
    <Dot
      v-for="dotValue in stepDots"
      :key="dotValue"
      :prefix-cls="prefixCls"
      :value="dotValue"
      :style="style"
      :active-style="activeStyle"
    />
  </div>
</template>
