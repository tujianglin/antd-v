<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties } from 'vue';
import type { LiteralUnion } from '../_util/type';
import { useConfigContextInject } from '../config-provider';
import { useRowContextInject } from './RowContext';
import { useColStyle } from './style';

type ColSpanType = number | string;

type FlexType = number | LiteralUnion<'none' | 'auto'>;

export interface ColSize {
  flex?: FlexType;
  span?: ColSpanType;
  order?: ColSpanType;
  offset?: ColSpanType;
  push?: ColSpanType;
  pull?: ColSpanType;
}

export interface ColProps {
  style?: CSSProperties;
  class?: string;
  flex?: FlexType;
  span?: ColSpanType;
  order?: ColSpanType;
  offset?: ColSpanType;
  push?: ColSpanType;
  pull?: ColSpanType;
  prefixCls?: string;
  xs?: ColSpanType | ColSize;
  sm?: ColSpanType | ColSize;
  md?: ColSpanType | ColSize;
  lg?: ColSpanType | ColSize;
  xl?: ColSpanType | ColSize;
  xxl?: ColSpanType | ColSize;
}

defineOptions({ name: 'Col', inheritAttrs: false, compatConfig: { MODE: 3 } });

const props = defineProps<ColProps>();
function parseFlex(flex: FlexType): string {
  if (typeof flex === 'number') {
    return `${flex} ${flex} auto`;
  }

  if (/^\d+(\.\d+)?(px|em|rem|%)$/.test(flex)) {
    return `0 0 ${flex}`;
  }

  return flex;
}
const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

const { getPrefixCls, direction } = toRefs(useConfigContextInject());
const { gutter, wrap } = toRefs(useRowContextInject());

const prefixCls = computed(() => getPrefixCls?.value('col', props.prefixCls));

const [hashId, cssVarCls] = useColStyle(prefixCls);

const { sizeStyle, sizeClassObj } = reactiveComputed(() => {
  const sizeStyle: Record<string, string> = {};

  let sizeClassObj: Record<string, boolean | ColSpanType> = {};
  sizes.forEach((size) => {
    let sizeProps: ColSize = {};
    const propSize = props[size];
    if (typeof propSize === 'number') {
      sizeProps.span = propSize;
    } else if (typeof propSize === 'object') {
      sizeProps = propSize || {};
    }

    sizeClassObj = {
      ...sizeClassObj,
      [`${prefixCls.value}-${size}-${sizeProps.span}`]: sizeProps.span !== undefined,
      [`${prefixCls.value}-${size}-order-${sizeProps.order}`]: sizeProps.order || sizeProps.order === 0,
      [`${prefixCls.value}-${size}-offset-${sizeProps.offset}`]: sizeProps.offset || sizeProps.offset === 0,
      [`${prefixCls.value}-${size}-push-${sizeProps.push}`]: sizeProps.push || sizeProps.push === 0,
      [`${prefixCls.value}-${size}-pull-${sizeProps.pull}`]: sizeProps.pull || sizeProps.pull === 0,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
    };

    // Responsive flex layout
    if (sizeProps.flex) {
      sizeClassObj[`${prefixCls.value}-${size}-flex`] = true;
      sizeStyle[`--${prefixCls.value}-${size}-flex`] = parseFlex(sizeProps.flex);
    }
  });
  return {
    sizeClassObj,
    sizeStyle,
  };
});

// ==================== Normal =====================
const classes = computed(() => {
  return clsx(
    prefixCls.value,
    {
      [`${prefixCls.value}-${props.span}`]: props.span !== undefined,
      [`${prefixCls.value}-order-${props.order}`]: props.order,
      [`${prefixCls.value}-offset-${props.offset}`]: props.offset,
      [`${prefixCls.value}-push-${props.push}`]: props.push,
      [`${prefixCls.value}-pull-${props.pull}`]: props.pull,
    },
    props.class,
    sizeClassObj,
    hashId.value,
    cssVarCls.value,
  );
});

const mergedStyle = computed(() => {
  const mergedStyle: CSSProperties = {};
  if (gutter.value && gutter.value[0] > 0) {
    const horizontalGutter = gutter.value[0] / 2;
    mergedStyle.paddingInline = `${horizontalGutter}px`;
  }

  if (props.flex) {
    mergedStyle.flex = parseFlex(props.flex);

    // Hack for Firefox to avoid size issue
    // https://github.com/ant-design/ant-design/pull/20023#issuecomment-564389553
    if (wrap.value === false && !mergedStyle.minWidth) {
      mergedStyle.minWidth = 0;
    }
  }
  return mergedStyle;
});
</script>
<template>
  <div :style="{ ...mergedStyle, ...style, ...sizeStyle }" :class="classes">
    <slot></slot>
  </div>
</template>
