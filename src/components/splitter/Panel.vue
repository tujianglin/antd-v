<script lang="tsx" setup>
import clsx from 'clsx';
import { computed } from 'vue';
import type { InternalPanelProps } from './interface';

defineOptions({ name: 'SplitterPanel', inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, class: className, size, style = {} } = defineProps<InternalPanelProps>();

const panelClassName = computed(() =>
  clsx(
    `${prefixCls}-panel`,
    {
      [`${prefixCls}-panel-hidden`]: size === 0,
    },
    className,
  ),
);

const hasSize = computed(() => size !== undefined);
</script>
<template>
  <div
    :class="panelClassName"
    :style="{
      ...style,
      // Use auto when start from ssr
      flexBasis: hasSize ? `${size}px` : 'auto',
      flexGrow: hasSize ? 0 : 1,
    }"
  >
    <slot></slot>
  </div>
</template>
