<script lang="tsx" setup>
import { computed } from 'vue';
import type { BlockProps } from './Base/index.vue';
import Base from './Base/index.vue';

export interface TitleProps extends Omit<BlockProps, 'strong'> {
  level?: 1 | 2 | 3 | 4 | 5;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { level = 1, copyable = undefined, ...restProps } = defineProps<TitleProps>();

const TITLE_ELE_LIST = [1, 2, 3, 4, 5] as const;

const dom = computed(() => (TITLE_ELE_LIST.includes(level) ? `h${level}` : `h1`));
</script>
<template>
  <Base v-bind="{ ...restProps, ...$attrs }" :copyable="copyable" :component="dom">
    <slot></slot>
  </Base>
</template>
