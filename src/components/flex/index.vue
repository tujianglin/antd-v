<script lang="tsx" setup>
import clsx from 'clsx';
import { omit } from 'lodash-es';
import { computed, getCurrentInstance, toRefs, type CSSProperties } from 'vue';
import { isPresetSize } from '../_util/gapSize';
import useOrientation from '../_util/hooks/useOrientation';
import { useConfigContextInject } from '../config-provider';
import type { FlexProps } from './interface';
import useStyle from './style';
import createFlexClassNames from './utils';

defineOptions({ name: 'Flex', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  rootClassName,
  class: className,
  style,
  flex,
  gap,
  vertical,
  orientation,
  component = 'div',
  ...othersProps
} = defineProps<FlexProps>();

const { flex: ctxFlex, direction: ctxDirection, getPrefixCls } = toRefs(useConfigContextInject());

const prefixCls = getPrefixCls.value('flex', customizePrefixCls);

const [hashId, cssVarCls] = useStyle(prefixCls);

const { mergedVertical } = toRefs(
  useOrientation(
    computed(() => orientation),
    computed(() => vertical ?? ctxFlex?.value?.vertical),
  ),
);

const wm = getCurrentInstance();

const mergedCls = computed(() => {
  return clsx(
    className,
    rootClassName,
    ctxFlex?.value?.class,
    prefixCls,
    hashId,
    cssVarCls,
    createFlexClassNames(prefixCls, wm.props),
    {
      [`${prefixCls}-rtl`]: ctxDirection?.value === 'rtl',
      [`${prefixCls}-gap-${gap}`]: isPresetSize(gap),
      [`${prefixCls}-vertical`]: mergedVertical.value,
    },
  );
});

const mergedStyle = computed((): CSSProperties => {
  const result: CSSProperties = { ...ctxFlex?.value?.style, ...style };
  if (flex) {
    result.flex = flex;
  }
  if (gap && !isPresetSize(gap)) {
    result.gap = `${gap}px`;
  }
  return result;
});
</script>
<template>
  <component :is="component" :class="mergedCls" :style="mergedStyle" v-bind="omit(othersProps, ['justify', 'wrap', 'align'])">
    <slot></slot>
  </component>
</template>
