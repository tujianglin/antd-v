<script lang="tsx" setup>
import clsx from 'clsx';
import { type CSSProperties } from 'vue';

export interface SkeletonTitleProps {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  width?: number | string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, class: className, width, style } = defineProps<SkeletonTitleProps>();
</script>
<template>
  <h3 :class="clsx(prefixCls, className)" :style="{ width, ...style }"></h3>
</template>
