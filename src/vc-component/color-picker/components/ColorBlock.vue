<script lang="tsx" setup>
import clsx from 'clsx';
import { type CSSProperties } from 'vue';

export type ColorBlockProps = {
  color: string;
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent) => void;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { color, prefixCls, class: className, style, onClick } = defineProps<ColorBlockProps>();

const colorBlockCls = `${prefixCls}-color-block`;
</script>
<template>
  <div :class="clsx(colorBlockCls, className)" :style="style" @click="onClick">
    <div :class="`${colorBlockCls}-inner`" :style="{ background: color }"></div>
  </div>
</template>
