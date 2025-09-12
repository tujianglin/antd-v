<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, type CSSProperties } from 'vue';
import Progress from './Progress.vue';

export interface IndicatorProps {
  prefixCls: string;
  percent?: number;
  class?: string;
  style?: CSSProperties;
}

const { prefixCls, percent = 0, class: className, style } = defineProps<IndicatorProps>();
const dotClassName = computed(() => `${prefixCls}-dot`);
const holderClassName = computed(() => `${dotClassName.value}-holder`);
const hideClassName = computed(() => `${holderClassName.value}-hidden`);
</script>
<template>
  <span :class="clsx(holderClassName, className, percent > 0 && hideClassName)" :style="style">
    <span :class="clsx(dotClassName, `${prefixCls}-dot-spin`)">
      <i v-for="i in [1, 2, 3, 4]" :class="`${prefixCls}-dot-item`" :key="i"></i>
    </span>
  </span>
  <Progress :prefix-cls="prefixCls" :percent="percent" />
</template>
