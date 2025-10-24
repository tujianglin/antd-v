<script lang="tsx" setup>
import type { CSSMotionProps } from '@/vc-component/motion';
import KeyCode from '@/vc-util/KeyCode';
import { computed, getCurrentInstance, onBeforeUnmount, ref, useTemplateRef, watch, type CSSProperties, type VNode } from 'vue';
import { DrawerContextProvider, useDrawerContextInject, type DrawerContextProps } from './context';
import type { DrawerPanelEvents } from './DrawerPanel.vue';
import type { DrawerClassNames, DrawerStyles } from './inter';
import CSSMotion from '@/vc-component/motion';
import clsx from 'clsx';
import { parseWidthHeight } from './util';
import DrawerPanel from './DrawerPanel.vue';
import pickAttrs from '@/vc-util/pickAttrs';
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import useDrag from './hooks/useDrag';
import { reactiveComputed } from '@vueuse/core';
export type Placement = 'left' | 'right' | 'top' | 'bottom';

export interface PushConfig {
  distance?: number | string;
}

export interface DrawerPopupProps extends DrawerPanelEvents {
  prefixCls: string;
  open?: boolean;
  inline?: boolean;
  push?: boolean | PushConfig;
  forceRender?: boolean;
  autofocus?: boolean;
  keyboard?: boolean;

  // Root
  rootClassName?: string;
  rootStyle?: CSSProperties;
  zIndex?: number;

  // Drawer
  placement?: Placement;
  id?: string;
  class?: string;
  style?: CSSProperties;
  /** Size of the drawer (width for left/right placement, height for top/bottom placement) */
  size?: number | string;
  /** Maximum size of the drawer */
  maxSize?: number;

  // Mask
  mask?: boolean;
  maskClosable?: boolean;
  maskClassName?: string;
  maskStyle?: CSSProperties;

  // Motion
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);
  maskMotion?: CSSMotionProps;

  // Events
  afterOpenChange?: (open: boolean) => void;
  onClose?: (event: MouseEvent | KeyboardEvent) => void;

  // classNames
  classNames?: DrawerClassNames;

  // styles
  styles?: DrawerStyles;
  drawerRender?: (node: VueNode) => VueNode;

  // resizable
  /** Default size for uncontrolled resizable drawer */
  defaultSize?: number | string;
  resizable?:
    | boolean
    | {
        onResize?: (size: number) => void;
        onResizeStart?: () => void;
        onResizeEnd?: () => void;
      };
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  open,
  placement,
  inline,
  push,
  forceRender,
  autofocus,
  keyboard,

  // classNames
  classNames: drawerClassNames,
  // Root
  rootClassName,
  rootStyle,
  zIndex,

  // Drawer
  class: className,
  id,
  style,
  motion,
  size,
  maxSize,

  // Mask
  mask,
  maskClosable,
  maskMotion,
  maskClassName,
  maskStyle,

  // Events
  afterOpenChange,
  onClose,
  onMouseenter,
  onMouseover,
  onMouseleave,
  onClick,
  onKeydown,
  onKeyup,

  styles,
  drawerRender,
  resizable,
  defaultSize,
} = defineProps<DrawerPopupProps>();

const slots = defineSlots<{ default?: () => VNode[] }>();

// ================================ Refs ================================
const panelRef = useTemplateRef('panelRef');
const sentinelStartRef = ref<HTMLDivElement>(null);
const sentinelEndRef = ref<HTMLDivElement>(null);
const wrapperRef = ref<HTMLDivElement>(null);

defineExpose({
  get el() {
    return panelRef.value;
  },
  get wrapper() {
    return wrapperRef.value;
  },
});

const onPanelKeyDown = (event) => {
  const { keyCode, shiftKey } = event;

  switch (keyCode) {
    // Tab active
    case KeyCode.TAB: {
      if (keyCode === KeyCode.TAB) {
        if (!shiftKey && document.activeElement === sentinelEndRef.value) {
          sentinelStartRef.value?.focus({ preventScroll: true });
        } else if (shiftKey && document.activeElement === sentinelStartRef.value) {
          sentinelEndRef.value?.focus({ preventScroll: true });
        }
      }
      break;
    }

    // Close
    case KeyCode.ESC: {
      if (onClose && keyboard) {
        event.stopPropagation();
        onClose(event);
      }
      break;
    }
  }
};

// ========================== Control ===========================
// Auto Focus
watch(
  () => open,
  () => {
    if (open && autofocus) {
      panelRef.value?.focus({ preventScroll: true });
    }
  },
  { immediate: true },
);

// ============================ Push ============================
const pushed = ref(false);

const parentContext = useDrawerContextInject();

// Merge push distance
const pushConfig = computed<PushConfig>(() => {
  let result;
  if (typeof push === 'boolean') {
    result = push ? {} : { distance: 0 };
  } else {
    result = push || {};
  }
  return result;
});
const pushDistance = computed(() => pushConfig.value?.distance ?? parentContext?.pushDistance ?? 180);

const mergedContext = computed<DrawerContextProps>(() => ({
  pushDistance: pushDistance.value,
  push: () => {
    pushed.value = true;
  },
  pull: () => {
    pushed.value = false;
  },
}));

// ========================= ScrollLock =========================
// Tell parent to push
watch(
  () => open,
  () => {
    if (open) {
      parentContext?.push?.();
    } else {
      parentContext?.pull?.();
    }
  },
  { immediate: true },
);

// Clean up
onBeforeUnmount(() => {
  parentContext?.pull?.();
});

// ============================ Mask ============================
const maskNode = () => {
  return (
    <CSSMotion key="mask" {...maskMotion} visible={mask && open}>
      {{
        default: ({ class: motionMaskClassName, style: motionMaskStyle, ref: maskRef }) => (
          <div
            class={clsx(`${prefixCls}-mask`, motionMaskClassName, drawerClassNames?.mask, maskClassName)}
            style={{
              ...motionMaskStyle,
              ...maskStyle,
              ...styles?.mask,
            }}
            onClick={(e) => (maskClosable && open ? onClose?.(e) : undefined)}
            ref={maskRef}
          />
        ),
      }}
    </CSSMotion>
  );
};

// =========================== Panel ============================
const motionProps = computed(() => (typeof motion === 'function' ? motion(placement) : motion));

// ============================ Size ============================
const currentSize = ref<number>();
const isHorizontal = computed(() => placement === 'left' || placement === 'right');

// Aggregate size logic with backward compatibility using useMemo
const mergedSize = computed(() => {
  const nextMergedSize = size ?? currentSize.value ?? defaultSize ?? (isHorizontal.value ? 378 : undefined);

  return parseWidthHeight(nextMergedSize);
});

// >>> Style
const wrapperStyle = computed(() => {
  const result: CSSProperties = {};

  if (pushed.value && pushDistance.value) {
    switch (placement) {
      case 'top':
        result.transform = `translateY(${pushDistance.value}px)`;
        break;
      case 'bottom':
        result.transform = `translateY(${-pushDistance.value}px)`;
        break;
      case 'left':
        result.transform = `translateX(${pushDistance.value}px)`;

        break;
      default:
        result.transform = `translateX(${-pushDistance.value}px)`;
        break;
    }
  }

  if (placement === 'left' || placement === 'right') {
    result.width = `${parseWidthHeight(mergedSize.value)}px`;
  } else {
    result.height = `${parseWidthHeight(mergedSize.value)}px`;
  }

  return result;
});

// =========================== Resize ===========================

const isResizable = computed(() => !!resizable);
const resizeConfig = computed(() => (typeof resizable === 'object' && resizable) || {});

const onInternalResize = (size: number) => {
  resizeConfig?.value?.onResize?.(size);
  currentSize.value = size;
};

const { dragElementProps, isDragging } = useDrag(
  reactiveComputed(() => ({
    prefixCls: `${prefixCls}-resizable`,
    direction: placement,
    class: drawerClassNames?.dragger,
    style: styles?.dragger,
    maxSize,
    containerRef: wrapperRef.value,
    currentSize: mergedSize.value,
    onResize: onInternalResize,
    onResizeStart: resizeConfig?.value?.onResizeStart,
    onResizeEnd: resizeConfig?.value?.onResizeEnd,
  })),
);

// =========================== Events ===========================
const eventHandlers = computed(() => ({
  onMouseenter,
  onMouseover,
  onMouseleave,
  onClick,
  onKeydown,
  onKeyup,
}));
const vm = getCurrentInstance();
const panelNode = () => (
  <CSSMotion
    key="panel"
    {...motionProps.value}
    visible={open}
    forceRender={forceRender}
    onVisibleChanged={(nextVisible) => {
      afterOpenChange?.(nextVisible);
    }}
    removeOnLeave={false}
    leavedClassName={`${prefixCls}-content-wrapper-hidden`}
  >
    {{
      default: ({ class: motionClassName, style: motionStyle, ref: motionRef }) => {
        const content = (
          <DrawerPanel
            id={id}
            ref={motionRef}
            prefixCls={prefixCls}
            class={clsx(className, drawerClassNames?.section)}
            style={{
              ...style,
              ...styles?.section,
            }}
            {...pickAttrs(vm.props, { aria: true })}
            {...eventHandlers.value}
          >
            {slots.default?.()}
          </DrawerPanel>
        );
        return (
          <div
            ref={wrapperRef}
            class={clsx(
              `${prefixCls}-content-wrapper`,
              isDragging.value && `${prefixCls}-content-wrapper-dragging`,
              drawerClassNames?.wrapper,
              !isDragging.value && motionClassName,
            )}
            style={{
              ...motionStyle,
              ...wrapperStyle.value,
              ...styles?.wrapper,
            }}
            {...pickAttrs(vm.props, { data: true })}
          >
            {isResizable.value && <div {...dragElementProps.value}></div>}
            <Render content={drawerRender ? drawerRender(content) : content}></Render>
          </div>
        );
      },
    }}
  </CSSMotion>
);

// =========================== Render ===========================
const containerStyle = computed(() => {
  const result: CSSProperties = {
    ...rootStyle,
  };

  if (zIndex) {
    result.zIndex = zIndex;
  }
  return result;
});

const sentinelStyle: CSSProperties = {
  width: 0,
  height: 0,
  overflow: 'hidden',
  outline: 'none',
  position: 'absolute',
};
</script>
<template>
  <DrawerContextProvider :value="mergedContext">
    <div
      :class="
        clsx(prefixCls, `${prefixCls}-${placement}`, rootClassName, {
          [`${prefixCls}-open`]: open,
          [`${prefixCls}-inline`]: inline,
        })
      "
      :style="containerStyle"
      :tabindex="-1"
      ref="panelRef"
      @keydown="onPanelKeyDown"
    >
      <Render :content="maskNode" />
      <div :tabindex="0" ref="sentinelStartRef" :style="sentinelStyle" aria-hidden="true" data-sentinel="start"></div>
      <Render :content="panelNode" />
      <div :tabindex="0" ref="sentinelEndRef" :style="sentinelStyle" aria-hidden="true" data-sentinel="end"></div>
    </div>
  </DrawerContextProvider>
</template>
