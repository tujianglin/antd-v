<script lang="tsx" setup>
import type { ActionType, AlignType, ArrowType, TriggerProps, TriggerRef } from '@/vc-component/trigger';
import { cloneVNode, computed, getCurrentInstance, ref, useId, type CSSProperties, type VNode } from 'vue';
import Popup from './Popup.vue';
import Trigger from '@/vc-component/trigger';
import clsx from 'clsx';
import placements from './placements';
import { Render } from '@/components';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';

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
  overlay?: any;
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
  overlay,
  id: _1,
  showArrow = true,
  classNames: tooltipClassNames,
  styles: tooltipStyles,
  ...restProps
} = defineProps<TooltipProps>();

const slots = defineSlots<{ overlay?: () => VNode[]; default?: () => VNode[] }>();

const overlayNode = computed(() => slots.overlay || overlay);

const mergedId = useId();
const triggerRef = ref<TriggerRef>(null);

defineExpose({
  get el() {
    return triggerRef.value;
  },
});

const vm = getCurrentInstance();

const extraProps = computed(() => {
  const res = JSON.parse(JSON.stringify(restProps));
  if ((vm.props as unknown as TooltipProps).visible) {
    res.popupVisible = (vm.props as unknown as TooltipProps).visible;
  }
  return res;
});

const getPopupElement = () => {
  return (
    <Popup
      key="content"
      prefixCls={prefixCls}
      id={mergedId}
      bodyClassName={tooltipClassNames?.body}
      overlayInnerStyle={{ ...tooltipStyles?.body }}
    >
      <Render content={overlayNode.value}></Render>
    </Popup>
  );
};

const children = computed(() => flattenChildren(slots.default())[0]);
</script>
<template>
  <Trigger
    :popup-class-name="clsx(tooltipClassNames?.root)"
    :prefix-cls="prefixCls"
    :popup="getPopupElement"
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
    <component
      v-if="children"
      :is="
        cloneVNode(children, {
          'aria-describedby': overlayNode ? mergedId : null,
        })
      "
    />
  </Trigger>
</template>
