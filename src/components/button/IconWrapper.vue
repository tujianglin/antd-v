<script lang="tsx" setup>
import { cn } from '@/utils/cn';
import { computed, type CSSProperties } from 'vue';

export type IconWrapperProps = {
  prefixCls: string;
  className?: string;
  style?: CSSProperties;
};

const { prefixCls, className } = defineProps<IconWrapperProps>();

const iconWrapperCls = computed(() => cn(`${prefixCls}-icon`, className));
</script>
<template>
  <span :class="iconWrapperCls" :style="style">
    <slot></slot>
  </span>
</template>
