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
  styles?: TooltipStyles;
  classNames?: TooltipClassNames;
}

export interface TooltipStyles {
  root?: CSSProperties;
  body?: CSSProperties;
}

export interface TooltipClassNames {
  root?: string;
  body?: string;
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
  arrowContent: _,
  overlay: customOverlay,
  id: _1,
  showArrow = true,
  classNames: tooltipClassNames,
  styles: tooltipStyles,
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

defineExpose({
  get el() {
    return triggerRef.value;
  },
});
</script>
<template>
  <Trigger
    :popup-class-name="clsx(tooltipClassNames?.root)"
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
    :popup-style="tooltipStyles?.root"
    :mouse-enter-delay="mouseEnterDelay"
    :arrow="showArrow"
    v-bind="extraProps"
  >
    <component :is="cloneVNode(slots.default?.()[0], { 'aria-describedby': overlay ? mergedId : null })" />
    <template #popup>
      <Popup
        key="content"
        :prefix-cls="prefixCls"
        :id="mergedId"
        :body-class-name="tooltipClassNames?.body"
        :overlay-inner-style="{ ...tooltipStyles?.body }"
      >
        <Render :content="overlay" />
      </Popup>
    </template>
  </Trigger>
</template>
