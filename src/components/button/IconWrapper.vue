<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, type CSSProperties } from 'vue';

export type IconWrapperProps = {
  prefixCls: string;
  class?: string;
  style?: CSSProperties;
};

const { prefixCls, class: className } = defineProps<IconWrapperProps>();

const iconWrapperCls = computed(() => clsx(`${prefixCls}-icon`, className));
</script>
<template>
  <span :class="iconWrapperCls" :style="style">
    <slot></slot>
  </span>
</template>
