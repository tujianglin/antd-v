<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties, type HTMLAttributes } from 'vue';
import { useConfigContextInject } from '../config-provider';

export interface CardGridProps extends /** @vue-ignore */ HTMLAttributes {
  prefixCls?: string;
  class?: string;
  hoverable?: boolean;
  style?: CSSProperties;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, class: className, hoverable = true, ...props } = defineProps<CardGridProps>();

const { getPrefixCls } = toRefs(useConfigContextInject());

const prefix = computed(() => getPrefixCls.value('card', prefixCls));
const classString = computed(() =>
  clsx(`${prefix.value}-grid`, className, {
    [`${prefix.value}-grid-hoverable`]: hoverable,
  }),
);
</script>
<template>
  <div v-bind="{ ...props, ...$attrs }" :class="classString"><slot></slot></div>
</template>
