<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, ref, toRefs, type CSSProperties } from 'vue';
import { responsiveArray, type Breakpoint, type ScreenMap } from '../_util/responsiveObserver';
import { useConfigContextInject } from '../config-provider';
import useBreakpoint from './hooks/useBreakpoint';
import useGutter from './hooks/useGutter';
import { RowContextProvider, type RowContextState } from './RowContext';
import { useRowStyle } from './style';

type Responsive = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';
type ResponsiveLike<T> = {
  // eslint-disable-next-line no-unused-vars
  [key in Responsive]?: T;
};

export type Gutter = number | undefined | Partial<Record<Breakpoint, number>>;

type ResponsiveAligns = ResponsiveLike<(typeof _RowAligns)[number]>;
type ResponsiveJustify = ResponsiveLike<(typeof _RowJustify)[number]>;

export interface RowProps {
  class?: string;
  style?: CSSProperties;
  gutter?: Gutter | [Gutter, Gutter];
  align?: (typeof _RowAligns)[number] | ResponsiveAligns;
  justify?: (typeof _RowJustify)[number] | ResponsiveJustify;
  prefixCls?: string;
  wrap?: boolean;
}

defineOptions({ name: 'Row', inheritAttrs: false, compatConfig: { MODE: 3 } });

const props = defineProps<RowProps>();

const _RowAligns = ['top', 'middle', 'bottom', 'stretch'] as const;
const _RowJustify = ['start', 'end', 'center', 'space-around', 'space-between', 'space-evenly'] as const;

function useMergedPropByScreen(oriProp: RowProps['align'] | RowProps['justify'], screen: ScreenMap | null) {
  const prop = ref(typeof oriProp === 'string' ? oriProp : '');

  if (typeof oriProp === 'string') {
    prop.value = oriProp;
  }
  if (typeof oriProp !== 'object') {
    return;
  }
  for (let i = 0; i < responsiveArray.length; i++) {
    const breakpoint: Breakpoint = responsiveArray[i];
    // if do not match, do nothing
    if (!screen || !screen[breakpoint]) {
      continue;
    }
    const curVal = oriProp[breakpoint];
    if (curVal !== undefined) {
      prop.value = curVal;
      return;
    }
  }

  return prop;
}

const { getPrefixCls, direction } = toRefs(useConfigContextInject());

const screens = useBreakpoint(true, null);

const mergedAlign = computed(() => useMergedPropByScreen(props.align, screens.value));
const mergedJustify = computed(() => useMergedPropByScreen(props.justify, screens.value));

const prefixCls = getPrefixCls?.value('row', props.prefixCls);

const [hashId, cssVarCls] = useRowStyle(prefixCls);

const gutters = computed(() => useGutter(props.gutter, screens.value));
const classes = computed(() => {
  return clsx(
    prefixCls,
    {
      [`${prefixCls}-no-wrap`]: props.wrap === false,
      [`${prefixCls}-${mergedJustify.value}`]: mergedJustify.value,
      [`${prefixCls}-${mergedAlign.value}`]: mergedAlign.value,
      [`${prefixCls}-rtl`]: direction?.value === 'rtl',
    },
    props.class,
    hashId,
    cssVarCls,
  );
});

// Add gutter related style
const { rowStyle, rowContext } = reactiveComputed((): { rowStyle: CSSProperties; rowContext: RowContextState } => {
  const rowStyle: CSSProperties = {};

  const horizontalGutter = gutters.value[0] !== null && gutters.value[0] > 0 ? gutters.value[0] / -2 : undefined;
  if (horizontalGutter) {
    rowStyle.marginInline = horizontalGutter;
  }
  const [gutterH, gutterV] = gutters.value;
  rowStyle.rowGap = gutterV;
  const rowContext: RowContextState = { gutter: [gutterH, gutterV] as [number, number], wrap: props.wrap };
  return { rowStyle, rowContext };
});
</script>
<template>
  <RowContextProvider :value="rowContext">
    <div :class="classes" :style="{ ...rowStyle, ...props.style }">
      <slot></slot>
    </div>
  </RowContextProvider>
</template>
