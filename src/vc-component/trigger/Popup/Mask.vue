<script lang="tsx" setup>
import clsx from 'clsx';
import type { TransitionProps } from 'vue';

export interface MaskProps {
  class?: string;
  prefixCls: string;
  open?: boolean;
  zIndex?: number;
  mask?: boolean;

  // Motion
  motion?: TransitionProps;

  mobile?: boolean;
}

const { class: className, zIndex, prefixCls, mobile } = defineProps<MaskProps>();
</script>
<template>
  <div v-if="mask" :style="{ zIndex }" :class="clsx(`${prefixCls}-mask`, mobile && `${prefixCls}-mobile-mask`, className)"></div>
</template>
