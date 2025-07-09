<script lang="tsx" setup>
import { computed } from 'vue';
import { cn } from '../../utils/cn';
import type { InternalPanelProps } from './interface';

defineOptions({ name: 'SplitterPanel' });

const { size, style = {} } = defineProps<InternalPanelProps>();

const hasSize = computed(() => size !== undefined);
</script>
<template>
  <div
    :class="cn('box-border overflow-auto [scrollbar-width:thin]', { hidden: size === 0 }, $attrs?.class)"
    :style="{ ...style, flexBasis: hasSize ? `${size}px` : 'auto', flexGrow: hasSize ? 0 : 1 }"
  >
    <slot></slot>
  </div>
</template>
