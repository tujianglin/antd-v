<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import type { CSSProperties } from 'vue';
import type { Breakpoint } from '../_util/responsiveObserver';

type SemanticName = 'label' | 'content';
export interface DescriptionsItemProps {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  label?: VueNode;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  classNames?: Partial<Record<SemanticName, string>>;
  children?: VueNode;
  // eslint-disable-next-line no-unused-vars
  span?: number | 'filled' | { [key in Breakpoint]?: number };
}

defineProps<DescriptionsItemProps>();
</script>
<template>
  <slot></slot>
</template>
