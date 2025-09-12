<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, toRefs } from 'vue';
import { useConfigContextInject } from '../config-provider';
import type { SkeletonElementProps } from './Element.vue';
import Element from './Element.vue';
import useStyle from './style';

export interface SkeletonButtonProps extends Omit<SkeletonElementProps, 'size'> {
  size?: 'large' | 'small' | 'default';
  block?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  classNames: skeletonButtonClassNames,
  active,
  style,
  styles,
  block = false,
  size = 'default',
  ...rest
} = defineProps<SkeletonButtonProps>();
const { getPrefixCls } = toRefs(useConfigContextInject());
const prefixCls = computed(() => getPrefixCls.value('skeleton', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);

const cls = computed(() =>
  clsx(
    prefixCls.value,
    `${prefixCls.value}-element`,
    {
      [`${prefixCls.value}-active`]: active,
      [`${prefixCls.value}-block`]: block,
    },
    skeletonButtonClassNames?.root,
    className,
    rootClassName,
    hashId.value,
    cssVarCls.value,
  ),
);
</script>
<template>
  <div :class="cls" :style="styles?.root">
    <Element
      :prefix-cls="`${prefixCls}-button`"
      :class="skeletonButtonClassNames?.content"
      :style="{ ...styles?.content, ...style }"
      :size="size"
      v-bind="rest"
    />
  </div>
</template>
