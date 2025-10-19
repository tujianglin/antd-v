<script lang="tsx" setup>
import clsx from 'clsx';
import { computed } from 'vue';

export interface ProgressIconProps {
  prefixCls: string;
  percent: number;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, percent } = defineProps<ProgressIconProps>();

const progressCls = computed(() => `${prefixCls}-item-progress-icon`);
const circleCls = computed(() => `${progressCls.value}-circle`);

const dashArray = computed(() => `calc(var(--progress-r) * 2 * ${(Math.PI * percent) / 100}) 9999`);
</script>
<template>
  <svg
    :class="`${progressCls}-svg`"
    viewBox="0 0 100 100"
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
    aria-valuemax="{100}"
    aria-valuemin="{0}"
    aria-valuenow="{percent}"
  >
    <title>Progress</title>
    <circle :class="clsx(circleCls, `${circleCls}-rail`)" />
    <circle :class="clsx(circleCls, `${circleCls}-ptg`)" :strokeDasharray="dashArray" transform="rotate(-90 50 50)" />
  </svg>
  <slot></slot>
</template>
