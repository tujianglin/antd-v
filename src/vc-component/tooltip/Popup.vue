<script lang="tsx" setup>
import clsx from 'clsx';
import { type CSSProperties } from 'vue';
export interface ContentProps {
  prefixCls?: string;
  id?: string;
  overlayInnerStyle?: CSSProperties;
  class?: string;
  style?: CSSProperties;
  bodyClassName?: string;
}

defineOptions({ name: 'Popup', inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, id, overlayInnerStyle: innerStyle, bodyClassName, class: className, style } = defineProps<ContentProps>();
</script>
<template>
  <div :class="clsx(`${prefixCls}-content`, className)" :style="style">
    <div :class="clsx(`${prefixCls}-inner`, bodyClassName)" :id="id" role="tooltip" :style="innerStyle">
      <slot></slot>
    </div>
  </div>
</template>
