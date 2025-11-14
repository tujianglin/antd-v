<script lang="tsx" setup>
import { omit } from 'es-toolkit/compat';
import { computed } from 'vue';
import type { BlockProps, EllipsisConfig } from './Base/index.vue';
import Base from './Base/index.vue';

export interface TextProps extends BlockProps {
  ellipsis?: boolean | Omit<EllipsisConfig, 'expandable' | 'rows' | 'onExpand'>;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { ellipsis, ...restProps } = defineProps<TextProps>();

const mergedEllipsis = computed(() => {
  if (ellipsis && typeof ellipsis === 'object') {
    return omit(ellipsis as EllipsisConfig, ['expandable', 'rows']);
  }
  return ellipsis;
});
</script>
<template>
  <Base v-bind="{ ...restProps, ...$attrs }" :ellipsis="mergedEllipsis" component="span"><slot></slot></Base>
</template>
