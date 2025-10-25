<script lang="tsx" setup>
import type { BlockProps } from './Base/index.vue';
import Base from './Base/index.vue';

export interface ParagraphProps extends BlockProps {}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { copyable = undefined, ...restProps } = defineProps<ParagraphProps>();
</script>
<template>
  <Base v-bind="{ ...restProps, ...$attrs }" :copyable="copyable" component="div"><slot></slot></Base>
</template>
