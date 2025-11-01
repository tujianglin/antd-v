<script lang="tsx" setup>
import CSSMotion from '@/vc-component/motion';
import clsx from 'clsx';
import { type CSSProperties, type HTMLAttributes } from 'vue';

export type MaskProps = {
  prefixCls: string;
  visible: boolean | undefined;
  motionName?: string;
  style?: CSSProperties;
  maskProps?: HTMLAttributes;
  class?: string;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, style, visible, maskProps, motionName, class: className } = defineProps<MaskProps>();
</script>
<template>
  <CSSMotion key="mask" :visible="visible" :motion-name="motionName" :leaved-class-name="`${prefixCls}-mask-hidden`">
    <template #default="{ class: motionClassName, style: motionStyle, ref: motionRef }">
      <div
        :ref="motionRef"
        :style="{ ...motionStyle, ...style }"
        :class="clsx(`${prefixCls}-mask`, motionClassName, className)"
        v-bind="maskProps"
      ></div>
    </template>
  </CSSMotion>
</template>
