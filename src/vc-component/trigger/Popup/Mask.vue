<script lang="tsx" setup>
import type { CSSMotionProps } from '@/vc-component/motion';
import CSSMotion from '@/vc-component/motion';
import clsx from 'clsx';

export interface MaskProps {
  prefixCls: string;
  open?: boolean;
  zIndex?: number;
  mask?: boolean;

  // Motion
  motion?: CSSMotionProps;

  mobile?: boolean;
}

const {
  prefixCls,
  open,
  zIndex,

  mask,
  motion,

  mobile,
} = defineProps<MaskProps>();
</script>
<template>
  <CSSMotion v-if="mask" v-bind="motion" motion-appear :visible="open" remove-on-leave>
    <template #default="{ class: className, ref: motionRef }">
      <div
        :ref="motionRef"
        :style="{ zIndex }"
        :class="clsx(`${prefixCls}-mask`, mobile && `${prefixCls}-mobile-mask`, className)"
      ></div>
    </template>
  </CSSMotion>
</template>
