<script lang="tsx" setup>
import type { CSSMotionProps } from '@/vc-component/motion';
import clsx from 'clsx';

export interface MaskProps {
  class?: string;
  prefixCls: string;
  open?: boolean;
  zIndex?: number;
  mask?: boolean;

  // Motion
  motion?: CSSMotionProps;

  mobile?: boolean;
}

const { class: className, zIndex, prefixCls, mobile } = defineProps<MaskProps>();
</script>
<template>
  <div v-if="mask" :style="{ zIndex }" :class="clsx(`${prefixCls}-mask`, mobile && `${prefixCls}-mobile-mask`, className)"></div>
</template>
