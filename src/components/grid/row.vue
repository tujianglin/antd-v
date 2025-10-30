<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, ref, toRefs, watch, type CSSProperties, type Ref } from 'vue';
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

export type Gutter = number | string | undefined | Partial<Record<Breakpoint, number>>;

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

const {
  prefixCls: customizePrefixCls,
  justify,
  align,
  class: className,
  style,
  gutter = 0,
  wrap = true,
  ...others
} = defineProps<RowProps>();

const _RowAligns = ['top', 'middle', 'bottom', 'stretch'] as const;
const _RowJustify = ['start', 'end', 'center', 'space-around', 'space-between', 'space-evenly'] as const;

function useMergedPropByScreen(oriProp: Ref<RowProps['align'] | RowProps['justify']>, screen: Ref<ScreenMap | null>) {
  const prop = ref(typeof oriProp?.value === 'string' ? oriProp?.value : '');

  const calcMergedAlignOrJustify = () => {
    if (typeof oriProp?.value === 'string') {
      prop.value = oriProp?.value;
    }
    if (typeof oriProp?.value !== 'object') {
      return;
    }
    for (let i = 0; i < responsiveArray.length; i++) {
      const breakpoint: Breakpoint = responsiveArray[i];
      // if do not match, do nothing
      if (!screen?.value || !screen?.value?.[breakpoint]) {
        continue;
      }
      const curVal = oriProp?.value[breakpoint];
      if (curVal !== undefined) {
        prop.value = curVal;
        return;
      }
    }
  };

  watch(
    [oriProp, screen],
    () => {
      calcMergedAlignOrJustify();
    },
    { immediate: true, deep: true },
  );

  return prop;
}

const { getPrefixCls, direction } = toRefs(useConfigContextInject());

const screens = useBreakpoint(true, null);

const mergedAlign = useMergedPropByScreen(
  computed(() => align),
  screens,
);
const mergedJustify = useMergedPropByScreen(
  computed(() => justify),
  screens,
);

const prefixCls = computed(() => getPrefixCls?.value('row', customizePrefixCls));

const [hashId, cssVarCls] = useRowStyle(prefixCls);

const gutters = useGutter(
  computed(() => gutter),
  screens,
);

const classes = computed(() => {
  return clsx(
    prefixCls.value,
    {
      [`${prefixCls.value}-no-wrap`]: wrap === false,
      [`${prefixCls.value}-${mergedJustify.value}`]: mergedJustify.value,
      [`${prefixCls.value}-${mergedAlign.value}`]: mergedAlign.value,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
    },
    className,
    hashId.value,
    cssVarCls.value,
  );
});

// Add gutter related style
const rowProps = computed((): { rowStyle: CSSProperties; rowContext: RowContextState } => {
  const rowStyle: CSSProperties = {};
  if (gutters.value?.[0]) {
    const horizontalGutter =
      typeof gutters.value[0] === 'number' ? `${gutters.value[0] / -2}px` : `calc(${gutters.value[0]} / -2)`;
    rowStyle.marginInline = horizontalGutter;
  }

  const [gutterH, gutterV] = gutters.value;

  rowStyle.rowGap = `${gutterV}px`;

  const rowContext: RowContextState = { gutter: [gutterH, gutterV] as [number, number], wrap };
  return { rowStyle, rowContext };
});
</script>
<template>
  <RowContextProvider :value="rowProps.rowContext">
    <div v-bind="others" :class="classes" :style="{ ...rowProps.rowStyle, ...style }">
      <slot></slot>
    </div>
  </RowContextProvider>
</template>
