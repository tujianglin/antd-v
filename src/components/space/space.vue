<script lang="tsx" setup>
import { cn } from '@/utils/cn';
import { reactiveComputed } from '@vueuse/core';
import { computed, type CSSProperties } from 'vue';
import { isPresetSize, isValidGapNumber } from '../_util/gapSize';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import useOrientation from '../_util/hooks/useOrientation';
import { useComponentConfig } from '../config-provider/context';
import Item from './Item.vue';
import { SpaceContextProvider } from './context';
import type { SpaceProps } from './interface';
import useStyle from './style';
defineOptions({ name: 'Space' });

const props = withDefaults(defineProps<SpaceProps>(), { wrap: false });

const config = useComponentConfig('space');

const size = computed(() => (props.size || config.size) ?? 'small');

const sizeConfig = reactiveComputed(() => {
  return Array.isArray(size.value)
    ? { horizontalSize: size.value[0], verticalSize: size.value[1] }
    : { horizontalSize: size.value, verticalSize: size.value };
});

const isPresetVerticalSize = computed(() => isPresetSize(sizeConfig.verticalSize));

const isPresetHorizontalSize = computed(() => isPresetSize(sizeConfig.horizontalSize));

const isValidVerticalSize = computed(() => isValidGapNumber(sizeConfig.verticalSize));

const isValidHorizontalSize = computed(() => isValidGapNumber(sizeConfig.horizontalSize));

const merged = useOrientation(
  computed(() => props.orientation),
  computed(() => props.vertical),
);

const mergedAlign = computed(() => (props.align === undefined && !merged.mergedVertical ? 'center' : props.align));

const prefixCls = config.getPrefixCls('space', props.prefixCls);

const [hashId, cssVarCls] = useStyle(prefixCls);

const mergedCs = useMergeSemantic(
  computed(() => [config.classNames, props.classNames]),
  computed(() => [config.styles, props.styles]),
);

const rootClassNames = computed(() => {
  return cn(
    prefixCls,
    config.class,
    hashId,
    `${prefixCls}-${merged.mergedOrientation}`,
    {
      [`${prefixCls}-rtl`]: config.direction === 'rtl',
      [`${prefixCls}-align-${mergedAlign.value}`]: mergedAlign.value,
      [`${prefixCls}-gap-row-${sizeConfig.verticalSize}`]: isPresetVerticalSize.value,
      [`${prefixCls}-gap-col-${sizeConfig.horizontalSize}`]: isPresetHorizontalSize.value,
    },
    props.class,
    props.rootClassName,
    cssVarCls,
    mergedCs.mergedClassNames?.root,
  );
});

const itemClassName = computed(() => cn(`${prefixCls}-item`, mergedCs.mergedClassNames?.item));

const gapStyle = computed((): CSSProperties => {
  const gapStyle: CSSProperties = {};

  if (props.wrap) {
    gapStyle.flexWrap = 'wrap';
  }

  if (!isPresetHorizontalSize.value && isValidHorizontalSize.value) {
    gapStyle.columnGap = sizeConfig.horizontalSize;
  }

  if (!isPresetVerticalSize.value && isValidVerticalSize.value) {
    gapStyle.rowGap = sizeConfig.verticalSize;
  }
  return gapStyle;
});
</script>
<template>
  <div :class="rootClassNames" :style="{ ...gapStyle, ...mergedCs.mergedStyles.root, ...config.style, ...props.style }">
    <SpaceContextProvider :value="{ latestIndex: $slots.default?.()?.length - 1 }">
      <Item
        v-for="(child, index) in $slots.default?.()"
        :key="index"
        :prefix="prefixCls"
        :class-names="mergedCs.mergedClassNames"
        :styles="mergedCs.mergedStyles"
        :class="itemClassName"
        :index="index"
        :separator="props.separator"
        :style="mergedCs.mergedStyles.item"
      >
        <component :is="child" />
      </Item>
    </SpaceContextProvider>
  </div>
</template>
