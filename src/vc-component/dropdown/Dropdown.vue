<script lang="tsx" setup>
import type { TriggerProps } from '@/vc-component/trigger';
import Trigger from '@/vc-component/trigger';
import type { ActionType, AlignType, AnimationType, BuildInPlacements } from '@/vc-component/trigger/interface';
import { cloneElement } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, ref, useTemplateRef, type CSSProperties } from 'vue';
import useAccessibility from './hooks/useAccessibility';
import Overlay from './Overlay.vue';
import Placements from './placements';

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
  overlay?: VueNode;
  trigger?: ActionType | ActionType[];
  alignPoint?: boolean;
  showAction?: ActionType[];
  hideAction?: ActionType[];
  visible?: boolean;
  autofocus?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  arrow = undefined,
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
  visible = undefined,
  trigger = ['hover'],
  autofocus,
  overlay,
  onVisibleChange,
  ...otherProps
} = defineProps<DropdownProps>();

const triggerVisible = ref<boolean>();
const mergedVisible = computed(() => visible ?? triggerVisible.value);
const mergedMotionName = computed(() => (animation ? `${prefixCls}-${animation}` : transitionName));

const triggerRef = useTemplateRef('triggerRef');
const overlayRef = useTemplateRef('overlayRef');
const childRef = ref(null);
defineExpose({
  get el() {
    return triggerRef.value;
  },
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
  const { onOverlayClick } = otherProps;
  triggerVisible.value = false;

  if (onOverlayClick) {
    onOverlayClick(e);
  }
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
  if (!result && trigger.indexOf('contextmenu') !== -1) {
    result = ['click'];
  }
  return result;
});
</script>
<template>
  <Trigger
    :builtin-placements="placements"
    v-bind="otherProps"
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
    @open-change="handleVisibleChange"
    @popup-click="onClick"
    :get-popup-container="getPopupContainer"
  >
    <template #popup>
      <Overlay ref="overlayRef" :overlay="overlay" :prefix-cls="prefixCls" :arrow="arrow" />
    </template>
    <component :is="cloneElement($slots.default?.()?.[0], { class: clsx(mergedVisible && getOpenClassName) })" />
  </Trigger>
</template>
