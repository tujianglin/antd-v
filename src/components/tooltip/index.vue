<script lang="tsx" setup>
import RcTooltip from '@/vc-component/tooltip';
import type { placements as Placements } from '@/vc-component/tooltip/placements';
import type { TooltipProps as RcTooltipProps } from '@/vc-component/tooltip/Tooltip.vue';
import type { BuildInPlacements } from '@/vc-component/trigger';
import clsx from 'clsx';
import { cloneVNode, computed, getCurrentInstance, h, toRefs, useAttrs, useSlots, useTemplateRef, type CSSProperties } from 'vue';
import type { PresetColorType } from '../_util/colors';
import { useZIndex } from '../_util/hooks/useZIndex';
import type { AdjustOverflow, PlacementsConfig } from '../_util/placements';
import getPlacements from '../_util/placements';
import type { LiteralUnion } from '../_util/type';
import { devUseWarning } from '../_util/warning';
import { ZIndexContextProvider } from '../_util/zindexContext';
import { useComponentConfig } from '../config-provider/context';
import useToken from '../theme/useToken';
import useMergedArrow from './hook/useMergedArrow';
import useStyle from './style';
import { parseColor } from './util';
import ContextIsolator from '../_util/ContextIsolator';
import { getTransitionName } from '../_util/motion';
import { isValidElement } from '../_util/isValidNode';
import { isFragment } from '../_util/reactNode';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import Render from '../render';

export type { AdjustOverflow, PlacementsConfig };

export interface TooltipRef {
  forceAlign: VoidFunction;
  /** Wrapped dom element. Not promise valid if child not support ref */
  nativeElement: HTMLElement;
  /** Popup dom element */
  popupElement: HTMLDivElement;
}

export type TooltipPlacement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom';

// https://github.com/react-component/tooltip
// https://github.com/yiminghe/dom-align
export interface TooltipAlignConfig {
  points?: [string, string];
  offset?: [number | string, number | string];
  targetOffset?: [number | string, number | string];
  overflow?: { adjustX: boolean; adjustY: boolean };
  useCssRight?: boolean;
  useCssBottom?: boolean;
  useCssTransform?: boolean;
}
// remove this after RcTooltip switch visible to open.
interface LegacyTooltipProps
  extends Partial<
    Omit<RcTooltipProps, 'visible' | 'defaultVisible' | 'onVisibleChange' | 'afterVisibleChange' | 'destroyTooltipOnHide'>
  > {
  onOpenChange?: RcTooltipProps['onVisibleChange'];
  afterOpenChange?: RcTooltipProps['afterVisibleChange'];
}

type SemanticName = 'root' | 'body';

export interface AbstractTooltipProps extends LegacyTooltipProps {
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  classNames?: Partial<Record<SemanticName, string>>;
  style?: CSSProperties;
  class?: string;
  rootClassName?: string;
  color?: LiteralUnion<PresetColorType>;
  placement?: TooltipPlacement;
  builtinPlacements?: typeof Placements;
  openClassName?: string;
  arrow?: boolean | { pointAtCenter?: boolean };
  autoAdjustOverflow?: boolean | AdjustOverflow;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  title?: string | number;
  /**
   * @since 5.25.0
   */
  destroyOnHidden?: boolean;
}

export declare type TooltipProps = AbstractTooltipProps;

defineOptions({ name: 'Tooltip', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  openClassName,
  getTooltipContainer,
  color,
  afterOpenChange,
  arrow: tooltipArrow,
  destroyOnHidden,
  title,
  builtinPlacements,
  autoAdjustOverflow = true,
  motion,
  getPopupContainer,
  placement = 'top',
  mouseEnterDelay = 0.1,
  mouseLeaveDelay = 0.1,
  rootClassName,
  styles,
  classNames: tooltipClassNames,
  onOpenChange,
  ...restProps
} = defineProps<TooltipProps>();

const vm = getCurrentInstance();

const [, token] = useToken();

const {
  getPopupContainer: getContextPopupContainer,
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
  arrow: contextArrow,
} = toRefs(useComponentConfig('tooltip'));
const mergedArrow = useMergedArrow(
  computed(() => tooltipArrow),
  contextArrow,
);
const mergedShowArrow = computed(() => mergedArrow.show);

// ============================== Ref ===============================
const warning = devUseWarning('Tooltip');

// ============================== Warn ==============================
if (process.env.NODE_ENV !== 'production') {
  [
    ['overlayStyle', 'styles.root'],
    ['overlayInnerStyle', 'styles.body'],
    ['overlayClassName', 'classNames.root'],
    ['destroyTooltipOnHide', 'destroyOnHidden'],
  ].forEach(([deprecatedName, newName]) => {
    warning.deprecated(!(deprecatedName in vm.props), deprecatedName, newName);
  });
}

const tooltipRef = useTemplateRef('tooltipRef');

const forceAlign = () => {
  tooltipRef.value?.el?.forceAlign();
};

defineExpose({
  forceAlign,
  get nativeElement() {
    return tooltipRef.value?.el?.nativeElement;
  },
  get popupElement() {
    return tooltipRef.value?.el?.popupElement;
  },
});

// ============================== Open ==============================
const open = defineModel('open', { default: false });

const noTitle = computed(() => !title && title !== 0);

const onInternalOpenChange = (vis: boolean) => {
  open.value = noTitle.value ? false : vis;
  if (!noTitle.value && onOpenChange) {
    onOpenChange(vis);
  }
};

const tooltipPlacements = computed<BuildInPlacements>(() => {
  return (
    builtinPlacements ||
    getPlacements({
      arrowPointAtCenter: mergedArrow?.pointAtCenter ?? false,
      autoAdjustOverflow,
      arrowWidth: mergedShowArrow.value ? token.value.sizePopupArrow : 0,
      borderRadius: token.value.borderRadius,
      offset: token.value.marginXXS,
      visibleFirst: true,
    })
  );
});

const prefixCls = computed(() => getPrefixCls.value('tooltip', customizePrefixCls));
const rootPrefixCls = computed(() => getPrefixCls.value());
const attrs = useAttrs();

const injectFromPopover = computed(() => (attrs as any)['data-popover-inject']);

const tempOpen = computed(() => {
  let result = open.value;
  // Hide tooltip when there is no title
  if (!('open' in vm.props)) {
    result = false;
  }
  return result;
});

// Style
const [hashId, cssVarCls] = useStyle(prefixCls, !injectFromPopover.value);

// Color
const colorInfo = computed(() => parseColor(prefixCls.value, color));
const arrowContentStyle = computed(() => colorInfo.value.arrowStyle);

const rootClassNames = computed(() => {
  return clsx(
    { [`${prefixCls.value}-rtl`]: direction.value === 'rtl' },
    colorInfo.value.className,
    rootClassName,
    hashId.value,
    cssVarCls.value,
    contextClassName?.value,
    contextClassNames.value.root,
    tooltipClassNames?.root,
  );
});

const bodyClassNames = computed(() => clsx(contextClassNames.value.body, tooltipClassNames?.body));

// ============================ zIndex ============================
const [zIndex, contextZIndex] = useZIndex(
  'Tooltip',
  computed(() => restProps.zIndex),
);

// ============================= Render =============================
const slots = useSlots();
const children = computed(() => {
  const result = flattenChildren(slots?.default?.());
  return isValidElement(result) && !isFragment(result) && result.length === 1 ? result[0] : <span>{slots?.default?.()}</span>;
});

const childCls = computed(() => {
  return !children.value?.props?.class || typeof children.value?.props?.class === 'string'
    ? clsx(children.value?.props?.class, openClassName || `${prefixCls.value}-open`)
    : children.value?.props?.class;
});
</script>
<template>
  <ZIndexContextProvider :value="contextZIndex">
    <RcTooltip
      v-bind="restProps"
      :z-index="zIndex"
      :show-arrow="mergedShowArrow"
      :placement="placement"
      :mouse-enter-delay="mouseEnterDelay"
      :mouse-leave-delay="mouseLeaveDelay"
      :prefix-cls="prefixCls"
      :class-names="{ root: rootClassNames, body: bodyClassNames }"
      :styles="{
        root: {
          ...arrowContentStyle,
          ...contextStyles.root,
          ...contextStyle,
          ...styles?.root,
        },
        body: {
          ...contextStyles.body,
          ...styles?.body,
          ...colorInfo.overlayStyle,
        },
      }"
      :get-tooltip-container="getPopupContainer || getTooltipContainer || getContextPopupContainer"
      ref="tooltipRef"
      :builtin-placements="tooltipPlacements"
      :visible="tempOpen"
      @visible-change="onInternalOpenChange"
      :after-visible-change="afterOpenChange"
      :arrow-content="() => h('span', { class: `${prefixCls}-arrow-content` })"
      :motion="{
        motionName: getTransitionName(
          rootPrefixCls,
          'zoom-big-fast',
          typeof motion?.motionName === 'string' ? motion?.motionName : undefined,
        ),
        motionDeadline: 1000,
      }"
      :destroy-on-hidden="destroyOnHidden"
    >
      <template #default="props">
        <component v-if="tempOpen" :is="cloneVNode(children, { class: childCls, ...props })" />
        <Render v-else :content="children" v-bind="props" />
      </template>
      <template #overlay>
        <ContextIsolator space>
          <slot name="overlay">
            <slot name="title">
              {{ title }}
            </slot>
          </slot>
        </ContextIsolator>
      </template>
    </RcTooltip>
  </ZIndexContextProvider>
</template>
