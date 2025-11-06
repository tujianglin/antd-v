<script lang="tsx" setup>
import clsx from 'clsx';
import type { CSSProperties } from 'vue';
import type { TooltipProps } from './Tooltip.vue';
export interface ContentProps {
  prefixCls?: string;
  id?: string;
  classNames?: TooltipProps['classNames'];
  styles?: TooltipProps['styles'];
  class?: string;
  style?: CSSProperties;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, id, classNames, styles, class: className, style } = defineProps<ContentProps>();
</script>
<template>
  <div
    :class="clsx(`${prefixCls}-container`, classNames?.container, className)"
    :id="id"
    role="tooltip"
    :style="{ ...styles?.container, ...style }"
  >
    <slot></slot>
  </div>
</template>
