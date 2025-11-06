<!-- eslint-disable no-unused-vars -->
<script lang="tsx" setup>
import type { ActionType, AlignType, ArrowType, TriggerProps } from '@/vc-component/trigger';
import Trigger from '@/vc-component/trigger';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { cloneVNode, computed, getCurrentInstance, useId, useTemplateRef, type CSSProperties, type VNode } from 'vue';
import Render from '../render';
import type { TriggerRef } from '../trigger/index.vue';
import placements from './placements';
import Popup from './Popup.vue';

export type SemanticName = 'root' | 'arrow' | 'container' | 'uniqueContainer';

export interface TooltipProps
  extends Pick<
    TriggerProps,
    | 'onPopupAlign'
    | 'builtinPlacements'
    | 'fresh'
    | 'mouseLeaveDelay'
    | 'mouseEnterDelay'
    | 'prefixCls'
    | 'forceRender'
    | 'popupVisible'
  > {
  // Style
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;

  /** Config popup motion */
  trigger?: ActionType | ActionType[];
  placement?: string;
  /** Config popup motion */
  motion?: TriggerProps['popupMotion'];
  defaultVisible?: boolean;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  overlay?: VueNode;
  getTooltipContainer?: (node: HTMLElement) => HTMLElement;
  destroyOnHidden?: boolean;
  align?: AlignType;
  showArrow?: boolean | ArrowType;
  arrowContent?: any;
  id?: string;
  zIndex?: number;
  /**
   * Configures Tooltip to reuse the background for transition usage.
   * This is an experimental API and may not be stable.
   */
  unique?: TriggerProps['unique'];
}

export interface TooltipRef extends TriggerRef {}

defineOptions({ name: 'Tooltip', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  trigger = ['hover'],
  mouseEnterDelay = 0,
  mouseLeaveDelay = 0.1,
  prefixCls = 'rc-tooltip',

  onVisibleChange,
  afterVisibleChange,
  defaultVisible,
  motion,
  placement = 'right',
  align = {},
  destroyOnHidden = false,
  getTooltipContainer,
  arrowContent,
  overlay: customOverlay,
  id: _1,
  showArrow = true,
  classNames,
  styles,
  // eslint-disable-next-line unused-imports/no-unused-vars
  visible = undefined,
  ...restProps
} = defineProps<TooltipProps>();

const slots = defineSlots<{
  overlay: () => VNode[];
  default: () => VNode[];
}>();

const overlay = computed(() => slots.overlay || customOverlay);

const mergedId = useId();
const triggerRef = useTemplateRef('triggerRef');

const vm = getCurrentInstance() as { props: TooltipProps };

const extraProps = computed(() => {
  const res = JSON.parse(JSON.stringify(restProps));
  res.popupVisible = vm.props?.visible;
  return res;
});

// ========================= Arrow ==========================
// Process arrow configuration
const mergedArrow = computed(() => {
  if (!showArrow) {
    return false;
  }

  // Convert true to object for unified processing
  const arrowConfig = showArrow === true ? {} : showArrow;

  // Apply semantic styles with unified logic
  return {
    ...arrowConfig,
    class: clsx(arrowConfig.class, classNames?.arrow),
    style: { ...arrowConfig.style, ...styles?.arrow },
    content: arrowConfig.content ?? arrowContent,
  };
});

defineExpose({
  get el() {
    return triggerRef.value;
  },
});
</script>
<template>
  <Trigger
    :popup-class-name="classNames?.root"
    :prefix-cls="prefixCls"
    :action="trigger"
    :builtin-placements="placements"
    :popup-placement="placement"
    ref="triggerRef"
    :popup-align="align"
    :get-popup-container="getTooltipContainer"
    @open-change="onVisibleChange"
    :after-open-change="afterVisibleChange"
    :popup-motion="motion"
    :default-popup-visible="defaultVisible"
    :auto-destroy="destroyOnHidden"
    :mouse-leave-delay="mouseLeaveDelay"
    :popup-style="styles?.root"
    :mouse-enter-delay="mouseEnterDelay"
    :arrow="mergedArrow"
    :unique-container-class-name="classNames.uniqueContainer"
    :unique-container-style="styles.uniqueContainer"
    v-bind="extraProps"
  >
    <component :is="cloneVNode(slots.default?.()[0], { 'aria-describedby': overlay ? mergedId : null })" />
    <template #popup>
      <Popup key="content" :prefix-cls="prefixCls" :id="mergedId" :class-names="classNames" :styles="styles">
        <Render :content="overlay" />
      </Popup>
    </template>
  </Trigger>
</template>
