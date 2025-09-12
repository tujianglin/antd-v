<script lang="tsx" setup>
import clsx from 'clsx';
import { type CSSProperties } from 'vue';

type widthUnit = number | string;

export interface SkeletonParagraphProps {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  width?: widthUnit | Array<widthUnit>;
  rows?: number;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });
const { prefixCls, class: className, style, rows = 0 } = defineProps<SkeletonParagraphProps>();

const getWidth = (index: number, props: SkeletonParagraphProps) => {
  const { width, rows = 2 } = props;
  if (Array.isArray(width)) {
    return width[index];
  }
  // last paragraph
  if (rows - 1 === index) {
    return width;
  }
  return undefined;
};
</script>
<template>
  <ul :class="clsx(prefixCls, className)" :style="style">
    <li v-for="(_, index) in Array.from({ length: rows })" :key="index" :style="{ width: getWidth(index, $props) }"></li>
  </ul>
</template>
