<script lang="tsx" setup>
import { cloneElement, isValidElement } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, type CSSProperties } from 'vue';
import Looper from './Looper.vue';

export interface IndicatorProps {
  prefixCls: string;
  indicator?: VueNode;
  percent?: number;
  class?: string;
  style?: CSSProperties;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, indicator, percent, class: className, style } = defineProps<IndicatorProps>();
const dotClassName = computed(() => `${prefixCls}-dot`);
</script>
<template>
  <component
    v-if="indicator && isValidElement(indicator)"
    :is="
      cloneElement(indicator, (currentProps) => ({
        className: clsx(currentProps.className, dotClassName, className),
        style: { ...currentProps.style, ...style },
        percent,
      }))
    "
  />
  <Looper v-else :prefix-cls="prefixCls" :percent="percent" :class="className" :style="style" />
</template>
