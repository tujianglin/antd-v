<script lang="tsx" setup>
import type { TriggerProps } from '@/vc-component/trigger';
import type { ActionType, AlignType, AnimationType, BuildInPlacements } from '@/vc-component/trigger/interface';
import { cloneVNode, computed, ref, useSlots, type CSSProperties } from 'vue';
import useAccessibility from './hooks/useAccessibility';
import Placements from './placements';
import Overlay from './Overlay.vue';
import Trigger from '@/vc-component/trigger';
import clsx from 'clsx';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';

export interface DropdownProps
  extends Pick<
    TriggerProps,
    'getPopupContainer' | 'mouseEnterDelay' | 'mouseLeaveDelay' | 'onPopupAlign' | 'builtinPlacements' | 'autoDestroy'
  > {
  minOverlayWidthMatchTrigger?: boolean;
  arrow?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onOverlayClick?: (e: Event) => void;
  prefixCls?: string;
  transitionName?: string;
  overlayClassName?: string;
  openClassName?: string;
  animation?: AnimationType;
  align?: AlignType;
  overlayStyle?: CSSProperties;
  placement?: keyof typeof Placements;
  placements?: BuildInPlacements;
  overlay?: any;
  trigger?: ActionType | ActionType[];
  alignPoint?: boolean;
  showAction?: ActionType[];
  hideAction?: ActionType[];
  visible?: boolean;
  autofocus?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  arrow = false,
  prefixCls = 'rc-dropdown',
  transitionName,
  animation,
  align,
  placement = 'bottomLeft',
  placements = Placements,
  getPopupContainer,
  showAction,
  hideAction,
  overlayClassName,
  overlayStyle,
  visible,
  trigger = ['hover'],
  autofocus,
  overlay,
  onVisibleChange,
  ...otherProps
} = defineProps<DropdownProps>();

const triggerVisible = ref<boolean>();
const mergedVisible = computed(() => visible || triggerVisible.value);
const mergedMotionName = computed(() => (animation ? `${prefixCls}-${animation}` : transitionName));

const triggerRef = ref(null);
const overlayRef = ref(null);
const childRef = ref(null);
defineExpose({
  ...triggerRef.value,
});

const handleVisibleChange = (newVisible: boolean) => {
  triggerVisible.value = newVisible;
  onVisibleChange?.(newVisible);
};

useAccessibility({
  visible: mergedVisible,
  triggerRef: childRef,
  onVisibleChange: handleVisibleChange,
  autofocus: computed(() => autofocus),
  overlayRef,
});

const onClick = (e) => {
  console.log(e);
  const { onOverlayClick } = otherProps;
  triggerVisible.value = false;

  if (onOverlayClick) {
    onOverlayClick(e);
  }
};

const getMenuElement = () => <Overlay ref={overlayRef} overlay={overlay} prefixCls={prefixCls} arrow={arrow} />;

const getMenuElementOrLambda = () => {
  if (typeof overlay === 'function') {
    return getMenuElement();
  }
  return getMenuElement();
};

const getMinOverlayWidthMatchTrigger = computed(() => {
  const { minOverlayWidthMatchTrigger, alignPoint } = otherProps;
  return minOverlayWidthMatchTrigger || !alignPoint;
});

const getOpenClassName = computed(() => {
  const { openClassName } = otherProps;
  if (openClassName !== undefined) {
    return openClassName;
  }
  return `${prefixCls}-open`;
});

const triggerHideAction = computed(() => {
  let result = hideAction;
  if (!result && trigger.indexOf('contextMenu') !== -1) {
    result = ['click'];
  }
  return result;
});

const slots = useSlots();

const children = computed(() => flattenChildren(slots.default?.())[0]);
</script>
<template>
  <Trigger
    v-bind="otherProps"
    :builtin-placements="placements"
    :prefix-cls="prefixCls"
    ref="triggerRef"
    :popup-class-name="
      clsx(overlayClassName, {
        [`${prefixCls}-show-arrow`]: arrow,
      })
    "
    :popup-style="overlayStyle"
    :action="trigger"
    :show-action="showAction"
    :hide-action="triggerHideAction"
    :popup-placement="placement"
    :popup-align="align"
    :popup-motion="{ motionName: mergedMotionName }"
    :popup-visible="mergedVisible"
    :stretch="getMinOverlayWidthMatchTrigger ? 'minWidth' : ''"
    :popup="getMenuElementOrLambda"
    @open-change="handleVisibleChange"
    @popup-click="onClick"
    :get-popup-container="getPopupContainer"
  >
    <component
      :is="
        cloneVNode(children, {
          class: clsx(children.props?.class, mergedVisible && getOpenClassName),
        })
      "
    />
  </Trigger>
</template>
<style lang="less">
@import './assets/index.less';
</style>
