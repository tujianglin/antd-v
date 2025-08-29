<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, type CSSProperties } from 'vue';
import type { Status } from './Steps.vue';

export interface RailProps {
  prefixCls: string;
  class: string;
  style: CSSProperties;
  status: Status;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, class: className, style, status } = defineProps<RailProps>();
const railCls = computed(() => `${prefixCls}-rail`);
</script>
<template>
  <div :class="clsx(railCls, `${railCls}-${status}`, className)" :style="style"></div>
</template>
