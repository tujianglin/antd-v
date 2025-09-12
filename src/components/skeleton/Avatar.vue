<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, toRefs } from 'vue';
import { useConfigContextInject } from '../config-provider';
import type { SkeletonElementProps } from './Element.vue';
import Element from './Element.vue';
import useStyle from './style';

export interface AvatarProps extends Omit<SkeletonElementProps, 'shape'> {
  shape?: 'circle' | 'square';
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  classNames: skeletonAvatarClassNames,
  rootClassName,
  active,
  style,
  styles,
  shape = 'circle',
  size = 'default',
  ...rest
} = defineProps<AvatarProps>();
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
    skeletonAvatarClassNames?.root,
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
      :prefix-cls="`${prefixCls}-avatar`"
      :class="skeletonAvatarClassNames?.content"
      :style="{ ...styles?.content, ...style }"
      :shape="shape"
      :size="size"
      v-bind="rest"
    />
  </div>
</template>
