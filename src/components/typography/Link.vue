<script lang="tsx" setup>
import { computed, useAttrs, type AnchorHTMLAttributes } from 'vue';
import type { BlockProps } from './Base/index.vue';
import Base from './Base/index.vue';

export interface LinkProps extends BlockProps, /** @vue-ignore */ Omit<AnchorHTMLAttributes, 'class' | 'style' | 'type'> {
  ellipsis?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });
const { ellipsis, ...restProps } = defineProps<LinkProps>();
const attrs = useAttrs();

const mergedProps = computed(() => {
  const result = {
    ...restProps,
    rel: attrs.rel === undefined && attrs.target === '_blank' ? 'noopener noreferrer' : attrs.rel,
  };
  // @ts-expect-error: https://github.com/ant-design/ant-design/issues/26622
  delete result.navigate;
  return result;
});
</script>
<template>
  <Base v-bind="{ ...$attrs, ...mergedProps }" :ellipsis="!!ellipsis" component="a"><slot></slot></Base>
</template>
