<script lang="tsx" setup>
import {
  computed,
  nextTick,
  onMounted,
  onUpdated,
  ref,
  shallowRef,
  useId,
  watch,
  watchEffect,
  type CSSProperties,
  type HTMLAttributes,
  type VNode,
} from 'vue';

import type { CSSMotionProps } from '@/vc-component/motion';
import ResizeObserver from '@/vc-component/resize-observer';
import { isDOM } from '@/vc-util/Dom/findDOMNode';
import { getShadowRoot } from '@/vc-util/Dom/shadow';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import Portal from '../portal';
import { TriggerContextProvider, useTriggerContextInject, useUniqueContextInject, type TriggerContextProps } from './context';
import useAction from './hooks/useAction';
import useAlign from './hooks/useAlign';
import useDelay from './hooks/useDelay';
import useWatch from './hooks/useWatch';
import useWinClick from './hooks/useWinClick';
import type { ActionType, AlignType, ArrowPos, ArrowTypeOuter, BuildInPlacements } from './interface';
import Popup, { type MobileConfig } from './Popup/index.vue';
import { getAlignPopupClassName } from './util';

export type { ActionType, AlignType, ArrowTypeOuter as ArrowType, BuildInPlacements };

export interface TriggerRef {
  nativeElement: HTMLElement;
  popupElement: HTMLDivElement;
  forceAlign: VoidFunction;
}

// Removed Props List
// Seems this can be auto
// getDocument?: (element?: HTMLElement) => Document;

// New version will not wrap popup with `rc-trigger-popup-content` when multiple children

export interface TriggerProps {
  action?: ActionType | ActionType[];
  showAction?: ActionType[];
  hideAction?: ActionType[];

  prefixCls?: string;

  zIndex?: number;

  onPopupAlign?: (element: HTMLElement, align: AlignType) => void;

  stretch?: string;

  // ==================== Open =====================
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  onOpenChange?: (visible: boolean) => void;
  afterOpenChange?: (visible: boolean) => void;

  // =================== Portal ====================
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  forceRender?: boolean;
  autoDestroy?: boolean;

  // ==================== Mask =====================
  mask?: boolean;
  maskClosable?: boolean;

  // =================== Motion ====================
  /** Set popup motion. You can ref `rc-motion` for more info. */
  popupMotion?: CSSMotionProps;
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps;

  // ==================== Delay ====================
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;

  focusDelay?: number;
  blurDelay?: number;

  // ==================== Popup ====================
  popup?: VueNode;
  popupPlacement?: string;
  builtinPlacements?: BuildInPlacements;
  popupAlign?: AlignType;
  popupClassName?: string;
  /** Pass to `UniqueProvider` UniqueContainer */
  uniqueContainerClassName?: string;
  /** Pass to `UniqueProvider` UniqueContainer */
  uniqueContainerStyle?: CSSProperties;
  popupStyle?: CSSProperties;
  getPopupClassNameFromAlign?: (align: AlignType) => string;
  onPopupClick?: (e: MouseEvent) => void;

  alignPoint?: boolean; // Maybe we can support user pass position in the future

  /**
   * Trigger will memo content when close.
   * This may affect the case if want to keep content update.
   * Set `fresh` to `false` will always keep update.
   */
  fresh?: boolean;

  /**
   * Config with UniqueProvider to shared the floating popup.
   */
  unique?: boolean;

  // ==================== Arrow ====================
  arrow?: boolean | ArrowTypeOuter;

  // // ========================== Mobile ==========================
  /**
   * @private Bump fixed position at bottom in mobile.
   * Will replace the config of root props.
   * This will directly trade as mobile view which will not check what real is.
   * This is internal usage currently, do not use in your prod.
   */
  mobile?: MobileConfig;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls = 'rc-trigger-popup',

  // Action
  action = ['hover'],
  showAction,
  hideAction,

  // Open
  popupVisible,
  defaultPopupVisible,
  onOpenChange,
  afterOpenChange,

  // Delay
  mouseEnterDelay,
  mouseLeaveDelay = 0.1,

  focusDelay,
  blurDelay,

  // Mask
  mask,
  maskClosable = true,

  // Portal
  getPopupContainer,
  forceRender,
  autoDestroy,

  // Popup
  popup,
  popupClassName,
  uniqueContainerClassName,
  uniqueContainerStyle,
  popupStyle,

  popupPlacement,
  builtinPlacements = {},
  popupAlign,
  zIndex,
  stretch,
  getPopupClassNameFromAlign,
  fresh,
  unique,

  alignPoint,

  onPopupClick,
  onPopupAlign,

  // Arrow
  arrow,

  // Motion
  popupMotion,
  maskMotion,

  // Private
  mobile,

  ...restProps
} = defineProps<TriggerProps>();

const slots = defineSlots<{
  popup: () => VNode[];
}>();

const popupSlot = computed(() => slots.popup?.() || popup);

const mergedAutoDestroy = computed(() => autoDestroy || false);
const openUncontrolled = computed(() => popupVisible === undefined);

// =========================== Mobile ===========================
const isMobile = computed(() => !!mobile);

// ========================== Context ===========================
const subPopupElements = shallowRef<Record<string, HTMLElement>>({});

const parentContext = useTriggerContextInject();
const context = computed<TriggerContextProps>(() => {
  return {
    registerSubPopup: (id, subPopupEle) => {
      subPopupElements.value[id] = subPopupEle;

      parentContext?.registerSubPopup(id, subPopupEle);
    },
  };
});

// ======================== UniqueContext =========================
const uniqueContext = useUniqueContextInject();

// =========================== Popup ============================
const id = useId();
const popupEle = ref<HTMLDivElement>(null);

// Used for forwardRef popup. Not use internal
const externalPopupRef = shallowRef<HTMLDivElement>(null);

const setPopupRef = (node) => {
  const { el } = node || {};
  externalPopupRef.value = el;

  if (isDOM(el) && popupEle.value !== el) {
    popupEle.value = el;
  }

  parentContext?.registerSubPopup(id, el);
};

// =========================== Target ===========================
// Use state to control here since `useRef` update not trigger render
const targetEle = ref<HTMLElement>(null);

// Used for forwardRef target. Not use internal
const externalForwardRef = shallowRef<HTMLElement>(null);

const setTargetRef = (node) => {
  const { el } = node || {};
  if (isDOM(el) && targetEle.value !== el) {
    targetEle.value = el;
    externalForwardRef.value = el;
  }
};

// ========================== Children ==========================
const originChildProps = ref(null);
type CloneProps = Pick<
  HTMLAttributes,
  | 'onClick'
  | 'onMouseenter'
  | 'onMouseleave'
  | 'onMousemove'
  | 'onPointerenter'
  | 'onPointerleave'
  | 'onFocus'
  | 'onBlur'
  | 'onContextmenu'
> & { onTouchstartPassive?: (e: TouchEvent) => void };
const cloneProps = ref<CloneProps>({});

const inPopupOrChild = (ele: EventTarget) => {
  const childDOM = targetEle.value;

  return (
    childDOM?.contains(ele as HTMLElement) ||
    getShadowRoot(childDOM)?.host === ele ||
    ele === childDOM ||
    popupEle.value?.contains(ele as HTMLElement) ||
    getShadowRoot(popupEle.value)?.host === ele ||
    ele === popupEle.value ||
    Object.values(subPopupElements.value).some((subPopupEle) => subPopupEle?.contains(ele as HTMLElement) || ele === subPopupEle)
  );
};

// =========================== Arrow ============================
const innerArrow = computed<ArrowTypeOuter>(() =>
  arrow
    ? {
        // true and Object likely
        ...(arrow !== true ? arrow : {}),
      }
    : null,
);

// ============================ Open ============================
const internalOpen = ref(defaultPopupVisible || false);

// Render still use props as first priority
const mergedOpen = computed(() => popupVisible ?? internalOpen.value);

// We use effect sync here in case `popupVisible` back to `undefined`
const setMergedOpen = (nextOpen: boolean) => {
  if (openUncontrolled.value) {
    internalOpen.value = nextOpen;
  }
};

// Support ref
const isOpen = () => mergedOpen.value;

watch(
  () => popupVisible,
  async () => {
    await nextTick();
    internalOpen.value = popupVisible || false;
  },
  { flush: 'post', immediate: true },
);

// Extract common options for UniqueProvider
const getUniqueOptions = (delay: number = 0) => ({
  popup: popupSlot.value,
  target: targetEle.value,
  delay,
  prefixCls,
  popupClassName,
  uniqueContainerClassName,
  uniqueContainerStyle,
  popupStyle,
  popupPlacement,
  builtinPlacements,
  popupAlign,
  zIndex,
  mask,
  maskClosable,
  popupMotion,
  maskMotion,
  arrow: innerArrow.value,
  getPopupContainer,
  getPopupClassNameFromAlign,
  id,
});

// Handle controlled state changes for UniqueProvider
// Only sync to UniqueProvider when it's controlled mode
// If there is a parentContext, don't call uniqueContext methods
watch(
  [mergedOpen, targetEle],
  async () => {
    await nextTick();
    if (uniqueContext && unique && targetEle.value && !openUncontrolled.value && !parentContext) {
      if (mergedOpen.value) {
        uniqueContext.show(getUniqueOptions(mouseEnterDelay), isOpen);
      } else {
        uniqueContext.hide(mouseLeaveDelay);
      }
    }
  },
  { flush: 'post', immediate: true, deep: true },
);

const openRef = shallowRef(mergedOpen.value);
watchEffect(() => {
  openRef.value = mergedOpen.value;
});

const lastTriggerRef = shallowRef<boolean[]>([]);
onUpdated(() => {
  lastTriggerRef.value = [];
});

const internalTriggerOpen = (nextOpen: boolean) => {
  setMergedOpen(nextOpen);

  // Enter or Pointer will both trigger open state change
  // We only need take one to avoid duplicated change event trigger
  // Use `lastTriggerRef` to record last open type
  if ((lastTriggerRef.value[lastTriggerRef.value.length - 1] ?? mergedOpen.value) !== nextOpen) {
    lastTriggerRef.value.push(nextOpen);
    onOpenChange?.(nextOpen);
  }
};

// Trigger for delay
const delayInvoke = useDelay();

const triggerOpen = (nextOpen: boolean, delay = 0) => {
  // If it's controlled mode, always use internal trigger logic
  // UniqueProvider will be synced through useLayoutEffect
  if (popupVisible !== undefined) {
    delayInvoke(() => {
      internalTriggerOpen(nextOpen);
    }, delay);
    return;
  }

  // If UniqueContext exists and not controlled, pass delay to Provider instead of handling it internally
  // If there is a parentContext, don't call uniqueContext methods
  if (uniqueContext && unique && openUncontrolled.value && !parentContext) {
    if (nextOpen) {
      uniqueContext.show(getUniqueOptions(delay), isOpen);
    } else {
      uniqueContext.hide(delay);
    }
    return;
  }

  delayInvoke(() => {
    internalTriggerOpen(nextOpen);
  }, delay);
};

// ========================== Motion ============================
const inMotion = ref(false);
const firstMount = ref(false);

onMounted(() => {
  firstMount.value = true;
});

watch(
  mergedOpen,
  () => {
    if (firstMount.value || mergedOpen.value) {
      inMotion.value = true;
    }
  },
  { flush: 'post', immediate: true },
);

const motionPrepareResolve = ref<VoidFunction>(null);

// =========================== Align ============================
const mousePos = ref<[x: number, y: number] | null>(null);

const setMousePosByEvent = (event: Pick<MouseEvent, 'clientX' | 'clientY'>) => {
  mousePos.value = [event.clientX, event.clientY];
};

const [ready, offsetX, offsetY, offsetR, offsetB, arrowX, arrowY, scaleX, scaleY, alignInfo, onAlign] = useAlign(
  mergedOpen,
  popupEle,
  computed(() => (alignPoint && mousePos.value !== null ? mousePos.value : targetEle.value)),
  computed(() => popupPlacement),
  computed(() => builtinPlacements),
  computed(() => popupAlign),
  onPopupAlign,
  isMobile,
);

const [showActions, hideActions] = useAction(
  computed(() => action),
  computed(() => showAction),
  computed(() => hideAction),
);

const clickToShow = computed(() => showActions.value.has('click'));
const clickToHide = computed(() => hideActions.value.has('click') || hideActions.value.has('contextMenu'));

const triggerAlign = () => {
  if (!inMotion.value) {
    onAlign();
  }
};

const onScroll = () => {
  if (openRef.value && alignPoint && clickToHide.value) {
    triggerOpen(false);
  }
};

useWatch(mergedOpen, targetEle, popupEle, triggerAlign, onScroll);

watch(
  [mousePos, () => popupPlacement],
  async () => {
    await nextTick();
    triggerAlign();
  },
  { flush: 'post', immediate: true, deep: true },
);

// When no builtinPlacements and popupAlign changed
watch(
  () => popupAlign,
  async () => {
    await nextTick();
    if (mergedOpen.value && !builtinPlacements?.[popupPlacement]) {
      triggerAlign();
    }
  },
  { flush: 'post', immediate: true, deep: true },
);

const alignedClassName = computed(() => {
  const baseClassName = getAlignPopupClassName(builtinPlacements, prefixCls, alignInfo.value, alignPoint);

  return clsx(baseClassName, getPopupClassNameFromAlign?.(alignInfo.value));
});

// ============================ Refs ============================
defineExpose({
  get nativeElement() {
    return externalForwardRef.value;
  },
  get popupElement() {
    return externalPopupRef.value;
  },
  forceAlign: triggerAlign,
});

// ========================== Stretch ===========================
const targetWidth = ref(0);
const targetHeight = ref(0);

const syncTargetSize = () => {
  if (stretch && targetEle.value) {
    const rect = targetEle.value.getBoundingClientRect();
    targetWidth.value = rect.width;
    targetHeight.value = rect.height;
  }
};

const onTargetResize = () => {
  syncTargetSize();
  triggerAlign();
};

// ========================== Motion ============================
const onVisibleChanged = (visible: boolean) => {
  inMotion.value = false;
  onAlign();
  afterOpenChange?.(visible);
};

// We will trigger align when motion is in prepare
const onPrepare = () =>
  new Promise<void>((resolve) => {
    syncTargetSize();
    motionPrepareResolve.value = resolve;
  });

watch(
  motionPrepareResolve,
  () => {
    if (motionPrepareResolve.value) {
      onAlign();
      motionPrepareResolve.value();
      motionPrepareResolve.value = null;
    }
  },
  { flush: 'post', immediate: true, deep: true },
);

// =========================== Action ===========================
/**
 * Util wrapper for trigger action
 * @param eventName  Listen event name
 * @param nextOpen  Next open state after trigger
 * @param delay Delay to trigger open change
 * @param callback Callback if current event need additional action
 * @param ignoreCheck  Ignore current event if check return true
 */
function wrapperAction(
  eventName: string,
  nextOpen: boolean,
  delay?: number,
  callback?: (event: Event) => void,
  ignoreCheck?: () => boolean,
) {
  cloneProps.value[eventName] = (event: any, ...args: any[]) => {
    if (!ignoreCheck || !ignoreCheck()) {
      callback?.(event);
      triggerOpen(nextOpen, delay);
    }

    // Pass to origin
    originChildProps.value?.[eventName]?.(event, ...args);
  };
}

// ======================= Action: Touch ========================
const touchToShow = computed(() => showActions.value.has('touch'));
const touchToHide = computed(() => hideActions.value.has('touch'));

/** Used for prevent `hover` event conflict with mobile env */
const touchedRef = shallowRef(false);

watch(
  [touchToShow, touchToHide],
  () => {
    if (touchToShow.value || touchToHide.value) {
      cloneProps.value.onTouchstartPassive = (...args: any[]) => {
        touchedRef.value = true;

        if (openRef.value && touchToHide.value) {
          triggerOpen(false);
        } else if (!openRef.value && touchToShow.value) {
          triggerOpen(true);
        }

        // Pass to origin
        originChildProps.value?.onTouchstartPassive?.(...args);
      };
    }
  },
  { immediate: true },
);

watch(
  [clickToShow, clickToHide],
  () => {
    // ======================= Action: Click ========================
    if (clickToShow.value || clickToHide.value) {
      cloneProps.value.onClick = (event, ...args: any[]) => {
        if (openRef.value && clickToHide.value) {
          triggerOpen(false);
        } else if (!openRef.value && clickToShow.value) {
          setMousePosByEvent(event);
          triggerOpen(true);
        }

        // Pass to origin
        originChildProps.value?.onClick?.(event, ...args);
        touchedRef.value = false;
      };
    }
  },
  { immediate: true },
);

// Click to hide is special action since click popup element should not hide
const onPopupPointerDown = useWinClick(
  mergedOpen,
  computed(() => clickToHide.value || touchToHide.value),
  targetEle,
  popupEle,
  computed(() => mask),
  computed(() => maskClosable),
  inPopupOrChild,
  triggerOpen,
);

// ======================= Action: Hover ========================
const hoverToShow = computed(() => showActions.value.has('hover'));
const hoverToHide = computed(() => hideActions.value.has('hover'));

let onPopupMouseEnter: (e: MouseEvent) => void;
let onPopupMouseLeave: VoidFunction;

const ignoreMouseTrigger = () => {
  return touchedRef.value;
};

watch(
  [hoverToShow],
  () => {
    if (hoverToShow.value) {
      const onMouseEnterCallback = (event) => {
        setMousePosByEvent(event);
      };

      // Compatible with old browser which not support pointer event
      wrapperAction('onMouseenter', true, mouseEnterDelay, onMouseEnterCallback, ignoreMouseTrigger);
      wrapperAction('onPointerenter', true, mouseEnterDelay, onMouseEnterCallback, ignoreMouseTrigger);

      onPopupMouseEnter = (event) => {
        // Only trigger re-open when popup is visible
        if ((mergedOpen.value || inMotion.value) && popupEle.value?.contains(event.target as HTMLElement)) {
          triggerOpen(true, mouseEnterDelay);
        }
      };

      // Align Point
      if (alignPoint) {
        cloneProps.value.onMousemove = (event: MouseEvent) => {
          originChildProps.value?.onMousemove?.(event);
        };
      }
    }
  },
  { immediate: true },
);

watch(
  hoverToHide,
  () => {
    if (hoverToHide.value) {
      wrapperAction('onMouseleave', false, mouseLeaveDelay, undefined, ignoreMouseTrigger);
      wrapperAction('onPointerleave', false, mouseLeaveDelay, undefined, ignoreMouseTrigger);

      onPopupMouseLeave = () => {
        triggerOpen(false, mouseLeaveDelay);
      };
    }
  },
  { immediate: true },
);

// ======================= Action: Focus ========================
watch(
  () => showActions.value.has('focus'),
  (val) => {
    if (val) {
      wrapperAction('onFocus', true, focusDelay);
    }
  },
  { immediate: true },
);

watch(
  () => hideActions.value.has('focus'),
  (val) => {
    if (val) {
      wrapperAction('onBlur', false, blurDelay);
    }
  },
  { immediate: true },
);

// ==================== Action: ContextMenu =====================
watch(
  () => hideActions.value.has('contextMenu'),
  (val) => {
    if (val) {
      cloneProps.value.onContextmenu = (event, ...args: any[]) => {
        if (openRef.value && hideActions.value.has('contextMenu')) {
          triggerOpen(false);
        } else {
          setMousePosByEvent(event);
          triggerOpen(true);
        }

        event.preventDefault();

        // Pass to origin
        originChildProps.value?.onContextmenu?.(event, ...args);
      };
    }
  },
  { immediate: true },
);

// ============================ Perf ============================
const rendedRef = shallowRef(false);
watchEffect(() => {
  rendedRef.value ||= forceRender || mergedOpen.value || inMotion.value;
});

// =========================== Render ===========================
const mergedChildrenProps = computed(() => ({
  ...originChildProps.value,
  ...cloneProps.value,
}));

// Pass props into cloneProps for nest usage
const passedProps = computed(() => {
  const result: Record<string, any> = {};
  const passedEventList = [
    'onContextmenu',
    'onClick',
    'onMousedown',
    'onTouchstartPassive',
    'onMouseenter',
    'onMouseleave',
    'onFocus',
    'onBlur',
  ];

  passedEventList.forEach((eventName) => {
    if (restProps[eventName]) {
      result[eventName] = (...args: any[]) => {
        mergedChildrenProps.value[eventName]?.(...args);
        restProps[eventName](...args);
      };
    }
  });
  return result;
});

const arrowPos = computed<ArrowPos>(() => ({
  x: arrowX.value,
  y: arrowY.value,
}));

// Child Node
const triggerProps = computed(() => ({
  ...mergedChildrenProps.value,
  ...passedProps.value,
}));
</script>
<template>
  <ResizeObserver :disabled="!mergedOpen" :ref="setTargetRef" @resize="onTargetResize">
    <slot v-bind="triggerProps"></slot>
  </ResizeObserver>
  <TriggerContextProvider v-if="rendedRef && (!uniqueContext || !unique)" :value="context">
    <Popup
      :portal="Portal"
      :ref="setPopupRef"
      :prefix-cls="prefixCls"
      :popup="popupSlot"
      :class="clsx(popupClassName, !isMobile && alignedClassName)"
      :style="popupStyle"
      :target="targetEle"
      @mouseenter="onPopupMouseEnter"
      @mouseleave="onPopupMouseLeave"
      @pointer-enter="onPopupMouseEnter"
      :z-index="zIndex"
      :open="mergedOpen"
      :keep-dom="inMotion"
      :fresh="fresh"
      @click="onPopupClick"
      @pointer-down-capture="onPopupPointerDown"
      :mask="mask"
      :motion="popupMotion"
      :mask-motion="maskMotion"
      @visible-changed="onVisibleChanged"
      @prepare="onPrepare"
      :force-render="forceRender"
      :auto-destroy="mergedAutoDestroy"
      :get-popup-container="getPopupContainer"
      :align="alignInfo"
      :arrow="innerArrow"
      :arrow-pos="arrowPos"
      :ready="ready"
      :offset-b="offsetB"
      :offset-r="offsetR"
      :offset-x="offsetX"
      :offset-y="offsetY"
      @align="triggerAlign"
      :stretch="stretch"
      :target-width="targetWidth / scaleX"
      :target-height="targetHeight / scaleY"
      :mobile="mobile"
    />
  </TriggerContextProvider>
</template>
