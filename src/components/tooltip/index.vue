<script lang="tsx" setup>
import RcTooltip from '@/vc-component/tooltip';
import type { placements as Placements } from '@/vc-component/tooltip/placements';
import type { TooltipProps as RcTooltipProps, TooltipRef as RcTooltipRef } from '@/vc-component/tooltip/Tooltip.vue';
import type { BuildInPlacements } from '@/vc-component/trigger';
import clsx from 'clsx';
import { cloneVNode, computed, getCurrentInstance, h, ref, toRefs, useAttrs, type CSSProperties, type VNode } from 'vue';
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
  /**
   * @since 5.25.0
   */
  destroyOnHidden?: boolean;
}

export interface TooltipPropsWithOverlay extends AbstractTooltipProps {
  title?: any;
  overlay?: any;
}

export interface TooltipPropsWithTitle extends AbstractTooltipProps {
  title: any;
  overlay?: any;
}

export declare type TooltipProps = TooltipPropsWithTitle | TooltipPropsWithOverlay;

defineOptions({ name: 'Tooltip', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  openClassName,
  getTooltipContainer,
  color,
  afterOpenChange,
  arrow: tooltipArrow,
  destroyOnHidden,
  title: defaultTitle,
  overlay: defaultOverlay,
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

const slots = defineSlots<{ default?: () => VNode[]; overlay?: () => VNode[]; title?: () => VNode[] }>();

const title = computed(() => slots.title || defaultTitle);
const overlay = computed(() => slots.overlay || defaultOverlay);

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

const tooltipRef = ref<RcTooltipRef>(null);

const forceAlign = () => {
  tooltipRef.value?.forceAlign();
};

defineExpose({
  forceAlign,
  get nativeElement() {
    return tooltipRef.value?.nativeElement;
  },
  get popupElement() {
    return tooltipRef.value?.popupElement;
  },
});

// ============================== Open ==============================
const open = defineModel('open', { default: false });

const noTitle = computed(() => !title.value && !overlay.value && title.value !== 0); // overlay for old version compatibility

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

const memoOverlay = computed<TooltipProps['overlay']>(() => {
  if (title.value === 0) {
    return title.value;
  }
  return overlay.value || title.value || '';
});

const prefixCls = computed(() => getPrefixCls.value('tooltip', customizePrefixCls));
const rootPrefixCls = computed(() => getPrefixCls.value());
const attrs = useAttrs();

const injectFromPopover = computed(() => (attrs as any)['data-popover-inject']);

const tempOpen = computed(() => {
  let result = open.value;
  // Hide tooltip when there is no title
  if (!('open' in vm.props) && noTitle.value) {
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

const memoOverlayWrapper = () => (
  <ContextIsolator space>{typeof memoOverlay.value === 'function' ? memoOverlay.value() : memoOverlay.value}</ContextIsolator>
);

// ============================= Render =============================
const child = () => {
  const children = flattenChildren(slots?.default?.());
  return isValidElement(children) && !isFragment(children) && children.length === 1 ? (
    children[0]
  ) : (
    <span>{slots?.default?.()}</span>
  );
};

const childProps = computed(() => {
  return child()?.props;
});

const childCls = computed(() => {
  return !childProps.value?.class || typeof childProps.value?.class === 'string'
    ? clsx(openClassName || `${prefixCls.value}-open`)
    : childProps.value?.class;
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
      :overlay="memoOverlayWrapper"
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
      <component v-if="tempOpen" :is="cloneVNode(child(), { class: childCls })" />
      <component v-else :is="child()" />
    </RcTooltip>
  </ZIndexContextProvider>
</template>
