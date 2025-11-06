<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, getCurrentInstance, toRefs, useSlots, type CSSProperties } from 'vue';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import { useMergeSemantic } from '../_util/hooks';
import type { Orientation } from '../_util/hooks/useOrientation';
import useOrientation from '../_util/hooks/useOrientation';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import useStyle from './style';

type SemanticName = 'root' | 'rail' | 'content';

export type TitlePlacement =
  | 'left'
  | 'right'
  | 'center'
  | 'start' // 👈 5.24.0+
  | 'end'; // 👈 5.24.0+

export type DividerClassNamesType = SemanticClassNamesType<DividerProps, SemanticName>;
export type DividerStylesType = SemanticStylesType<DividerProps, SemanticName>;

export interface DividerProps {
  prefixCls?: string;
  orientation?: Orientation;
  vertical?: boolean;
  titlePlacement?: TitlePlacement;
  class?: string;
  rootClassName?: string;
  dashed?: boolean;
  /**
   * @since 5.20.0
   * @default solid
   */
  variant?: 'dashed' | 'dotted' | 'solid';
  style?: CSSProperties;
  size?: SizeType;
  plain?: boolean;
  classNames?: DividerClassNamesType;
  styles?: DividerStylesType;
}

const {
  prefixCls: customizePrefixCls,
  orientation,
  vertical,
  titlePlacement,
  class: className,
  rootClassName,
  dashed,
  variant = 'solid',
  plain,
  style,
  size: customSize,
  classNames,
  styles,
  ...restProps
} = defineProps<DividerProps>();

const slots = useSlots();

const titlePlacementList = ['left', 'right', 'center', 'start', 'end'];

const sizeClassNameMap: Record<string, string> = { small: 'sm', middle: 'md' };

const {
  getPrefixCls,
  direction,
  class: dividerClassName,
  style: dividerStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('divider'));

const prefixCls = computed(() => getPrefixCls.value('divider', customizePrefixCls));
const railCls = computed(() => `${prefixCls.value}-rail`);

const [hashId, cssVarCls] = useStyle(prefixCls);

const sizeFullName = useSize(computed(() => customSize));
const sizeCls = computed(() => sizeClassNameMap[sizeFullName.value]);

const validTitlePlacement = computed(() => titlePlacementList.includes(orientation || ''));

const mergedTitlePlacement = computed<'start' | 'end' | 'center'>(() => {
  const placement = titlePlacement ?? (validTitlePlacement.value ? (orientation as TitlePlacement) : 'center');
  if (placement === 'left') {
    return direction.value === 'rtl' ? 'end' : 'start';
  }
  if (placement === 'right') {
    return direction.value === 'rtl' ? 'start' : 'end';
  }
  return placement;
});

const hasMarginStart = computed(() => mergedTitlePlacement.value === 'start');

const hasMarginEnd = computed(() => mergedTitlePlacement.value === 'end');

const [mergedOrientation, mergedVertical] = useOrientation(
  computed(() => orientation),
  computed(() => vertical),
);

// ========================= Semantic =========================
const vm = getCurrentInstance();
const mergedProps = computed<DividerProps>(() => {
  return {
    ...vm.props,
    orientation: mergedOrientation.value,
    titlePlacement: mergedTitlePlacement.value,
    size: sizeFullName.value,
  };
});

const [mergedClassNames, mergedStyles] = useMergeSemantic<DividerClassNamesType, DividerStylesType, DividerProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({ props: mergedProps.value })),
);

const classString = computed(() =>
  clsx(
    prefixCls.value,
    dividerClassName?.value,
    hashId.value,
    cssVarCls.value,
    `${prefixCls.value}-${mergedOrientation.value}`,
    {
      [`${prefixCls.value}-with-text`]: !!slots.default,
      [`${prefixCls.value}-with-text-${mergedTitlePlacement.value}`]: !!slots.default,
      [`${prefixCls.value}-dashed`]: !!dashed,
      [`${prefixCls.value}-${variant}`]: variant !== 'solid',
      [`${prefixCls.value}-plain`]: !!plain,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
      [`${prefixCls.value}-no-default-orientation-margin-start`]: hasMarginStart.value,
      [`${prefixCls.value}-no-default-orientation-margin-end`]: hasMarginEnd.value,
      [`${prefixCls.value}-${sizeCls.value}`]: !!sizeCls.value,
      [railCls.value]: !slots.default,
      [mergedClassNames?.value?.rail as string]: mergedClassNames.value.rail && !slots.default,
    },
    className,
    rootClassName,
    mergedClassNames?.value?.root,
  ),
);

// =================== Warning =====================
if (process.env.NODE_ENV !== 'production') {
  const warning = devUseWarning('Divider');

  warning(!slots.default || !mergedVertical, 'usage', '`children` not working in `vertical` mode.');
  warning(!validTitlePlacement.value, 'usage', '`orientation` is used for direction, please use `titlePlacement` replace this');
}
</script>
<template>
  <div
    :class="classString"
    :style="{ ...dividerStyle, ...mergedStyles.root, ...(slots.default ? {} : mergedStyles.rail), ...style }"
    v-bind="restProps"
    role="separator"
  >
    <template v-if="!mergedVertical">
      <div :class="clsx(railCls, `${railCls}-start`, mergedClassNames.rail)" :style="mergedStyles.rail"></div>
      <span :class="clsx(`${prefixCls}-inner-text`, mergedClassNames.content)" :style="mergedStyles.content">
        <slot></slot>
      </span>
      <div :class="clsx(railCls, `${railCls}-end`, mergedClassNames.rail)" :style="mergedStyles.rail"></div>
    </template>
  </div>
</template>
