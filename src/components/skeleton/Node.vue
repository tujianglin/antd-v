<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, toRefs } from 'vue';
import { useConfigContextInject } from '../config-provider';
import type { SkeletonElementProps } from './Element.vue';
import useStyle from './style';

export interface SkeletonNodeProps extends Omit<SkeletonElementProps, 'size' | 'shape'> {
  internalClassName?: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  classNames: skeletonNodeClassNames,
  rootClassName,
  internalClassName,
  style,
  styles,
  active,
} = defineProps<SkeletonNodeProps>();
const { getPrefixCls } = toRefs(useConfigContextInject());
const prefixCls = computed(() => getPrefixCls.value('skeleton', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);

const cls = computed(() =>
  clsx(
    prefixCls.value,
    `${prefixCls.value}-element`,
    {
      [`${prefixCls.value}-active`]: active,
    },
    hashId.value,
    skeletonNodeClassNames?.root,
    className,
    rootClassName,
    cssVarCls.value,
  ),
);
</script>
<template>
  <div :class="cls" :style="styles?.root">
    <div
      :class="clsx(skeletonNodeClassNames?.content, internalClassName || `${prefixCls}-node`)"
      :style="{ ...styles?.content, ...style }"
    >
      <slot></slot>
    </div>
  </div>
</template>
