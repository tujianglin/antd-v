<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties } from 'vue';
import { isPresetSize, isValidGapNumber } from '../_util/gapSize';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import useOrientation from '../_util/hooks/useOrientation';
import { useComponentConfig } from '../config-provider/context';
import Item from './Item.vue';
import { SpaceContextProvider } from './context';
import type { SpaceProps } from './interface';
import useStyle from './style';

defineOptions({ name: 'Space', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  size: customizeSize = 'small',
  align,
  class: className,
  rootClassName,
  orientation,
  prefixCls: customizePrefixCls,
  separator,
  style,
  vertical,
  wrap = false,
  classNames: spaceClassNames,
  styles,
  ...restProps
} = defineProps<SpaceProps>();

const {
  getPrefixCls,
  direction: directionConfig,
  size: contextSize,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('space'));

const size = computed(() => (customizeSize || contextSize.value) ?? 'small');

const { horizontalSize, verticalSize } = toRefs(
  reactiveComputed(() => {
    return Array.isArray(size.value)
      ? { horizontalSize: size.value[0], verticalSize: size.value[1] }
      : { horizontalSize: size.value, verticalSize: size.value };
  }),
);

const isPresetVerticalSize = computed(() => isPresetSize(verticalSize.value));

const isPresetHorizontalSize = computed(() => isPresetSize(horizontalSize.value));

const isValidVerticalSize = computed(() => isValidGapNumber(verticalSize.value));

const isValidHorizontalSize = computed(() => isValidGapNumber(horizontalSize.value));

const { mergedOrientation, mergedVertical } = toRefs(
  useOrientation(
    computed(() => orientation),
    computed(() => vertical),
  ),
);

const mergedAlign = computed(() => (align === undefined && !mergedVertical.value ? 'center' : align));

const prefixCls = getPrefixCls.value('space', customizePrefixCls);

const [hashId, cssVarCls] = useStyle(prefixCls);

const { mergedClassNames, mergedStyles } = toRefs(
  useMergeSemantic(
    computed(() => [contextClassNames.value, spaceClassNames]),
    computed(() => [contextStyles.value, styles]),
  ),
);

const rootClassNames = computed(() => {
  return clsx(
    prefixCls,
    contextClassName?.value,
    hashId,
    `${prefixCls}-${mergedOrientation.value}`,
    {
      [`${prefixCls}-rtl`]: directionConfig?.value === 'rtl',
      [`${prefixCls}-align-${mergedAlign.value}`]: mergedAlign.value,
      [`${prefixCls}-gap-row-${verticalSize.value}`]: isPresetVerticalSize.value,
      [`${prefixCls}-gap-col-${horizontalSize.value}`]: isPresetHorizontalSize.value,
    },
    className,
    rootClassName,
    cssVarCls,
    mergedClassNames.value?.root,
  );
});

const itemClassName = computed(() => clsx(`${prefixCls}-item`, mergedClassNames.value?.item));

const gapStyle = computed((): CSSProperties => {
  const gapStyle: CSSProperties = {};

  if (wrap) {
    gapStyle.flexWrap = 'wrap';
  }

  if (!isPresetHorizontalSize.value && isValidHorizontalSize.value) {
    gapStyle.columnGap = horizontalSize.value;
  }

  if (!isPresetVerticalSize.value && isValidVerticalSize.value) {
    gapStyle.rowGap = verticalSize.value;
  }
  return gapStyle;
});
</script>
<template>
  <div :class="rootClassNames" :style="{ ...gapStyle, ...mergedStyles?.root, ...contextStyle, ...style }" v-bind="restProps">
    <SpaceContextProvider :value="{ latestIndex: $slots.default?.()?.length - 1 }">
      <Item
        v-for="(child, index) in $slots.default?.()"
        :key="index"
        :prefix="prefixCls"
        :class-names="mergedClassNames"
        :styles="mergedStyles"
        :class="itemClassName"
        :index="index"
        :separator="separator"
        :style="mergedStyles.item"
      >
        <component :is="child" />
      </Item>
    </SpaceContextProvider>
  </div>
</template>
