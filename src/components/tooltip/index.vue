<script lang="tsx" setup>
import RcTooltip from '@/vc-component/tooltip';
import type { placements as Placements } from '@/vc-component/tooltip/placements';
import type { TooltipProps as RcTooltipProps } from '@/vc-component/tooltip/Tooltip.vue';
import type { BuildInPlacements } from '@/vc-component/trigger';
import clsx from 'clsx';
import {
  cloneVNode,
  computed,
  getCurrentInstance,
  h,
  toRefs,
  useAttrs,
  useTemplateRef,
  type CSSProperties,
  type VNode,
} from 'vue';
import type { PresetColorType } from '../_util/colors';
import { useZIndex } from '../_util/hooks/useZIndex';
import type { AdjustOverflow, PlacementsConfig } from '../_util/placements';
import getPlacements from '../_util/placements';
import type { LiteralUnion } from '../_util/type';
import { ZIndexContextProvider } from '../_util/zindexContext';
import { useComponentConfig } from '../config-provider/context';
import useToken from '../theme/useToken';
import useMergedArrow from './hook/useMergedArrow';
import useStyle from './style';
import { parseColor } from './util';
import ContextIsolator from '../_util/ContextIsolator';
import { getTransitionName } from '../_util/motion';
import { isFragment, isValidElement } from '@/vc-util/Children/util';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import type { VueNode } from '@/vc-util/type';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';

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
    Omit<
      RcTooltipProps,
      'visible' | 'defaultVisible' | 'onVisibleChange' | 'afterVisibleChange' | 'destroyTooltipOnHide' | 'classNames' | 'styles'
    >
  > {
  onOpenChange?: RcTooltipProps['onVisibleChange'];
  afterOpenChange?: RcTooltipProps['afterVisibleChange'];
}

export type SemanticName = 'root' | 'container' | 'arrow';

export type TooltipClassNamesType = SemanticClassNamesType<TooltipProps, SemanticName>;

export type TooltipStylesType = SemanticStylesType<TooltipProps, SemanticName>;

export interface AbstractTooltipProps extends LegacyTooltipProps {
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
  title?: VueNode;
  /**
   * @since 5.25.0
   */
  destroyOnHidden?: boolean;
}

export interface TooltipProps extends AbstractTooltipProps {
  title?: VueNode;
  overlay?: VueNode;
  classNames?: TooltipClassNamesType;
  styles?: TooltipStylesType;
}

defineOptions({ name: 'Tooltip', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  openClassName,
  getTooltipContainer,
  color,
  afterOpenChange,
  arrow: tooltipArrow = undefined,
  destroyOnHidden,
  title: customTitle,
  builtinPlacements,
  autoAdjustOverflow = true,
  motion,
  getPopupContainer,
  placement = 'top',
  mouseEnterDelay = 0.1,
  mouseLeaveDelay = 0.1,
  rootClassName,
  styles,
  classNames,
  onOpenChange,
  overlay: cutsomOverlay,
  ...restProps
} = defineProps<TooltipProps>();

const slots = defineSlots<{
  default: () => VNode[];
  overlay: () => VNode[];
  title: () => VNode[];
}>();

const attrs = useAttrs();

const title = computed(() => slots.title || customTitle);
const overlay = computed(() => slots.overlay || cutsomOverlay);

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

const noTitle = computed(() => !title.value && !overlay.value && title.value !== 0);
const onInternalOpenChange = (vis: boolean) => {
  if (!noTitle.value && onOpenChange) {
    onOpenChange(vis);
  }
  if (!attrs?.slider) {
    open.value = noTitle.value ? false : vis;
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

const memoOverlayWrapper = computed(() => {
  // eslint-disable-next-line no-unused-expressions
  memoOverlay.value;
  return (
    <ContextIsolator>
      {typeof memoOverlay.value === 'function' ? (memoOverlay.value as any)() : memoOverlay.value}
    </ContextIsolator>
  );
});

const [mergedClassNames, mergedStyles] = useMergeSemantic<TooltipClassNamesType, TooltipStylesType, TooltipProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      color,
      placement,
      builtinPlacements,
      openClassName,
      arrow: tooltipArrow,
      autoAdjustOverflow,
      getPopupContainer,
      destroyOnHidden,
    },
  })),
);

const prefixCls = computed(() => getPrefixCls.value('tooltip', customizePrefixCls));
const rootPrefixCls = computed(() => getPrefixCls.value());

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
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, injectFromPopover);

// Color
const colorInfo = computed(() => parseColor(prefixCls.value, color));
const arrowContentStyle = computed(() => colorInfo.value.arrowStyle);

const themeCls = computed(() => clsx(rootCls.value, hashId.value, cssVarCls.value));

const rootClassNames = computed(() => {
  return clsx(
    { [`${prefixCls.value}-rtl`]: direction.value === 'rtl' },
    colorInfo.value.className,
    rootClassName,
    hashId.value,
    cssVarCls.value,
    contextClassName?.value,
    mergedClassNames.value.root,
  );
});

// ============================ zIndex ============================
const [zIndex, contextZIndex] = useZIndex(
  'Tooltip',
  computed(() => restProps.zIndex),
);

const containerStyle = computed<CSSProperties>(() => ({
  ...mergedStyles?.value?.container,
  ...colorInfo?.value?.overlayStyle,
}));

// ============================= Render =============================

const children = () => {
  const result = flattenChildren(slots?.default?.());
  return isValidElement(result) && !isFragment(result) && result.length === 1 ? result[0] : <span>{slots?.default?.()}</span>;
};

const childCls = computed(() => {
  const dom = children();
  return !dom?.props?.class || typeof dom?.props?.class === 'string'
    ? clsx(dom?.props?.class, openClassName || `${prefixCls.value}-open`)
    : dom?.props?.class;
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
      :class-names="{
        root: rootClassNames,
        container: mergedClassNames.container,
        arrow: mergedClassNames.arrow,
        uniqueContainer: clsx(themeCls, mergedClassNames.container),
      }"
      :styles="{
        root: {
          ...arrowContentStyle,
          ...mergedStyles.root,
          ...contextStyle,
        },
        container: containerStyle,
        uniqueContainer: containerStyle,
        arrow: mergedStyles.arrow,
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
      :overlay="memoOverlayWrapper"
      :destroy-on-hidden="destroyOnHidden"
    >
      <component :is="cloneVNode(children(), { class: tempOpen ? childCls : {} })" />
    </RcTooltip>
  </ZIndexContextProvider>
</template>
