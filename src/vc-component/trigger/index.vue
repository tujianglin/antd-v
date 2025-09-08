<script lang="tsx" setup>
import clsx from 'clsx';
import { isEmpty, omit } from 'lodash-es';
import {
  cloneVNode,
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toRefs,
  useId,
  watch,
  type HTMLAttributes,
  type VNode,
} from 'vue';
import { flattenChildren, isDOM } from '../../vc-util/Dom/findDOMNode';
import { getShadowRoot } from '../../vc-util/Dom/shadow';
import ResizeObserver from '../resize-observer';
import { TriggerContextProvider, useTriggerContextInject, type TriggerContextProps } from './context';
import useAction from './hooks/useAction';
import useAlign from './hooks/useAlign';
import useWatch from './hooks/useWatch';
import useWinClick from './hooks/useWinClick';
import type { ArrowPos, ArrowTypeOuter, TriggerProps } from './interface';
import Popup from './Popup';
import { getAlignPopupClassName } from './util';

defineOptions({ name: 'Trigger', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls = 'rc-trigger-popup',

  // Action
  action = 'hover',
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
  popupStyle,

  popupPlacement,
  builtinPlacements,
  popupAlign,
  zIndex,
  stretch,
  getPopupClassNameFromAlign,
  fresh,

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

const slots = defineSlots<{ popup?: () => VNode[]; default?: () => VNode[] }>();

const slotPopup = computed(() => slots.popup || popup);

// =========================== Mobile ===========================
const isMobile = computed(() => !!mobile);

// ========================== Context ===========================
const subPopupElements = ref<Record<string, HTMLElement>>({});
const parentContext = useTriggerContextInject();
const context = computed((): TriggerContextProps => {
  return {
    registerSubPopup: (id, subPopupEle) => {
      subPopupElements.value[id] = subPopupEle;
      parentContext?.registerSubPopup(id, subPopupEle);
    },
  };
});

// =========================== Popup ============================
const id = useId();
const popupEle = ref<HTMLDivElement>(null);

// Used for forwardRef popup. Not use internal
const externalPopupRef = ref<HTMLDivElement>(null);

const setPopupRef = (node) => {
  if (isEmpty(node)) return;
  externalPopupRef.value = node.el;

  if (isDOM(node.el) && popupEle.value !== node.el) {
    popupEle.value = node.el;
  }
  parentContext?.registerSubPopup(id, node.el);
};

// =========================== Target ===========================
// Use state to control here since `useRef` update not trigger render
const targetEle = ref<HTMLElement>(null);

// Used for forwardRef target. Not use internal
const externalForwardRef = ref<HTMLElement>(null);

const setTargetRef = (node) => {
  if (isDOM(node?.el) && targetEle.value !== node.el) {
    targetEle.value = node.el;
    externalForwardRef.value = node.el;
  }
};

// ========================== Children ==========================
const originChildProps = ref(null);

type CloneProps = Pick<
  HTMLAttributes,
  | 'onClick'
  | 'onTouchstart'
  | 'onMouseenter'
  | 'onMouseleave'
  | 'onMousemove'
  | 'onPointerenter'
  | 'onPointerleave'
  | 'onFocus'
  | 'onBlur'
  | 'onContextmenu'
>;
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

// ============================ Open ============================
const internalOpen = ref(defaultPopupVisible);

// Render still use props as first priority
const mergedOpen = computed(() => popupVisible || internalOpen.value);

// We use effect sync here in case `popupVisible` back to `undefined`
const setMergedOpen = (nextOpen: boolean) => {
  if (!popupVisible) {
    internalOpen.value = nextOpen;
  }
};

watch(
  () => popupVisible,
  async (val) => {
    await nextTick();
    internalOpen.value = val;
  },
  { immediate: true },
);

const lastTriggerRef = ref<boolean[]>([]);

const internalTriggerOpen = (nextOpen: boolean) => {
  lastTriggerRef.value = [];
  nextTick(() => {
    setMergedOpen(nextOpen);
  });
  // Enter or Pointer will both trigger open state change
  // We only need take one to avoid duplicated change event trigger
  // Use `lastTriggerRef` to record last open type
  if ((lastTriggerRef.value[lastTriggerRef.value.length - 1] ?? mergedOpen.value) !== nextOpen) {
    lastTriggerRef.value.push(nextOpen);
    onOpenChange?.(nextOpen);
  }
};

// Trigger for delay
const delayRef = ref<ReturnType<typeof setTimeout>>(null);

const clearDelay = () => {
  clearTimeout(delayRef.value);
};

const triggerOpen = (nextOpen: boolean, delay = 0) => {
  clearDelay();

  if (delay === 0) {
    internalTriggerOpen(nextOpen);
  } else {
    delayRef.value = setTimeout(() => {
      internalTriggerOpen(nextOpen);
    }, delay * 1000);
  }
};

onBeforeUnmount(() => clearDelay());

// ========================== Motion ============================
const inMotion = ref(false);

let isMount = false;

onMounted(() => {
  isMount = true;
});

watch(
  () => mergedOpen.value,
  (val) => {
    if (!isMount || val) {
      inMotion.value = true;
    }
  },
);

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
  isMobile.value,
);

const { showActions, hideActions } = toRefs(
  useAction(
    computed(() => action),
    computed(() => showAction),
    computed(() => hideAction),
  ),
);

const clickToHide = computed(() => hideActions.value.has('click') || hideActions.value.has('contextMenu'));

const triggerAlign = () => {
  if (!inMotion.value) {
    onAlign();
  }
};

const onScroll = () => {
  if (mergedOpen.value && alignPoint && clickToHide.value) {
    triggerOpen(false);
  }
};

useWatch(mergedOpen, targetEle, popupEle, triggerAlign, onScroll);

watch(
  [() => mousePos.value, () => popupPlacement],
  async () => {
    await nextTick();
    triggerAlign();
  },
  { flush: 'post', immediate: true, deep: true },
);

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

watch(
  () => stretch,
  () => {
    onTargetResize();
  },
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
function wrapperAction<Event extends MouseEvent>(
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

/** Used for prevent `hover` event conflict with mobile env */
const touchedRef = ref(false);

// Click to hide is special action since click popup element should not hide
const onPopupPointerDown = useWinClick(
  mergedOpen,
  computed(() => clickToHide.value || hideActions.value.has('touch')),
  targetEle,
  popupEle,
  computed(() => mask),
  computed(() => maskClosable),
  inPopupOrChild,
  triggerOpen,
);

let onPopupMouseEnter: (e: MouseEvent) => void;
let onPopupMouseLeave: VoidFunction;

const ignoreMouseTrigger = () => {
  return touchedRef.value;
};

watch(
  [() => showActions.value, () => hideActions.value],
  ([shows, hides]) => {
    cloneProps.value = {};
    originChildProps.value = {};
    // ======================= Action: Touch ========================
    if (shows.has('touch') || hides.has('touch')) {
      cloneProps.value.onTouchstart = (...args: any[]) => {
        touchedRef.value = true;

        if (mergedOpen.value && hides.has('touch')) {
          triggerOpen(false);
        } else if (!mergedOpen.value && shows.has('touch')) {
          triggerOpen(true);
        }

        // Pass to origin
        originChildProps.value?.onTouchstart(...args);
      };
    }

    // ======================= Action: Click ========================
    if (shows.has('click') || hides.has('click') || hides.has('contextMenu')) {
      cloneProps.value.onClick = (event: MouseEvent, ...args: any[]) => {
        if (mergedOpen.value && (hides.has('click') || hides.has('contextMenu'))) {
          triggerOpen(false);
        } else if (!mergedOpen.value && shows.has('click')) {
          setMousePosByEvent(event);
          triggerOpen(true);
        }
        // Pass to origin
        originChildProps.value.onClick?.(event, ...args);
        touchedRef.value = false;
      };
    }

    // ======================= Action: Hover ========================
    if (shows.has('hover')) {
      const onMouseEnterCallback = (event: MouseEvent) => {
        setMousePosByEvent(event);
      };
      // Compatible with old browser which not support pointer event
      wrapperAction<MouseEvent>('onMouseenter', true, mouseEnterDelay, onMouseEnterCallback, ignoreMouseTrigger);
      wrapperAction<PointerEvent>('onPointerenter', true, mouseEnterDelay, onMouseEnterCallback, ignoreMouseTrigger);
      onPopupMouseEnter = (event) => {
        // Only trigger re-open when popup is visible
        if ((mergedOpen.value || inMotion.value) && popupEle.value?.contains(event.target as HTMLElement)) {
          triggerOpen(true, mouseEnterDelay);
        }
      };

      // Align Point
      if (alignPoint) {
        cloneProps.value.onMousemove = (event: MouseEvent) => {
          originChildProps.value.onMousemove?.(event);
        };
      }
    }

    if (hides.has('hover')) {
      wrapperAction('onMouseleave', false, mouseLeaveDelay, undefined, ignoreMouseTrigger);
      wrapperAction('onPointerleave', false, mouseLeaveDelay, undefined, ignoreMouseTrigger);
      onPopupMouseLeave = () => {
        triggerOpen(false, mouseLeaveDelay);
      };
    }

    // ======================= Action: Focus ========================
    if (shows.has('focus')) {
      wrapperAction('onFocus', true, focusDelay);
    }

    if (hides.has('focus')) {
      wrapperAction('onBlur', false, blurDelay);
    }

    // ==================== Action: ContextMenu =====================
    if (shows.has('contextMenu')) {
      cloneProps.value.onContextmenu = (event: MouseEvent, ...args: any[]) => {
        if (mergedOpen.value && hides.has('contextMenu')) {
          triggerOpen(false);
        } else {
          setMousePosByEvent(event);
          triggerOpen(true);
        }

        event.preventDefault();

        // Pass to origin
        originChildProps.value.onContextmenu?.(event, ...args);
      };
    }
  },
  { immediate: true, deep: true },
);

// ============================ Perf ============================
const rendedRef = ref(false);
watch(
  [() => forceRender, () => mergedOpen.value, () => inMotion.value],
  async () => {
    await nextTick();
    if (!rendedRef.value) {
      rendedRef.value = forceRender || mergedOpen.value || inMotion.value;
    }
  },
  { flush: 'post', immediate: true },
);

// =========================== Render ===========================
const mergedChildrenProps = computed(() => ({
  ...originChildProps.value,
  ...cloneProps.value,
}));

const passedProps = computed(() => {
  // Pass props into cloneProps for nest usage
  const result: Record<string, any> = {};
  const passedEventList = [
    'onContextMenu',
    'onClick',
    'onMouseDown',
    'onTouchStart',
    'onMouseEnter',
    'onMouseLeave',
    'onFocus',
    'onBlur',
  ];
  passedEventList.forEach((eventName) => {
    if (restProps[eventName]) {
      result[eventName] = (...args: any[]) => {
        mergedChildrenProps[eventName]?.(...args);
        restProps[eventName](...args);
      };
    }
  });
  return result;
});

const arrowPos = computed((): ArrowPos => {
  return {
    x: arrowX.value,
    y: arrowY.value,
  };
});

const innerArrow = computed(
  (): ArrowTypeOuter =>
    arrow
      ? {
          // true and Object likely
          ...(arrow !== true ? arrow : {}),
        }
      : null,
);

// ========================== Motion ============================

const motionPrepareResolve = ref<VoidFunction>(null);
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
  () => motionPrepareResolve.value,
  (val) => {
    if (val) {
      onAlign();
      val();
      motionPrepareResolve.value = null;
    }
  },
);
const onVnodeMounted = (vnode: any) => {
  const el = vnode.el as HTMLElement;
  if (el) {
    el.addEventListener('touchstart', mergedChildrenProps.value.onTouchstart, { passive: true });
  }
};

const onVnodeBeforeUnmount = (vnode: any) => {
  const el = vnode.el as HTMLElement;
  if (el) {
    el.removeEventListener('touchstart', mergedChildrenProps.value.onTouchstart);
  }
};
</script>
<template>
  <ResizeObserver :disabled="!mergedOpen" :ref="setTargetRef" @resize="onTargetResize">
    <component
      :is="
        cloneVNode(flattenChildren(slots.default?.())[0], {
          ...omit(mergedChildrenProps, 'onTouchstart'),
          ...passedProps,
          ...flattenChildren(slots.default?.())[0].props,
          onVnodeMounted,
          onVnodeBeforeUnmount,
        })
      "
    />
  </ResizeObserver>
  <TriggerContextProvider v-if="rendedRef" :value="context">
    <Popup
      :ref="setPopupRef"
      :prefix-cls="prefixCls"
      :popup="slotPopup"
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
      :auto-destroy="autoDestroy"
      :get-popup-container="getPopupContainer"
      :align="alignInfo"
      :arrow="innerArrow"
      :arrow-pos="arrowPos"
      :ready="ready"
      :offset-b="offsetB"
      :offset-r="offsetR"
      :offset-x="offsetX"
      :offset-y="offsetY"
      @align="onAlign"
      :stretch="stretch"
      :target-width="targetWidth / scaleX"
      :target-height="targetHeight / scaleY"
      :mobile="mobile"
    />
  </TriggerContextProvider>
</template>
