<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, toRefs } from 'vue';
import { useConfigContextInject } from '../config-provider';
import type { SkeletonElementProps } from './Element.vue';
import Element from './Element.vue';
import useStyle from './style';

export interface SkeletonInputProps extends Omit<SkeletonElementProps, 'size' | 'shape'> {
  size?: 'large' | 'small' | 'default';
  block?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  classNames: skeletonInputClassNames,
  rootClassName,
  active,
  block,
  style,
  styles,
  size = 'default',
  ...rest
} = defineProps<SkeletonInputProps>();
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
    skeletonInputClassNames?.root,
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
      :prefix-cls="`${prefixCls}-input`"
      :class="skeletonInputClassNames?.content"
      :style="{ ...styles?.content, ...style }"
      :size="size"
      v-bind="rest"
    />
  </div>
</template>
