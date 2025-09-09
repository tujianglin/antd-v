<script lang="tsx" setup>
import ResizeObserver from '@/vc-component/resize-observer';
import clsx from 'clsx';
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch, type CSSProperties } from 'vue';
import throttleByAnimationFrame from '../_util/throttleByAnimationFrame';
import { useComponentConfig, useConfigContextInject } from '../config-provider/context';
import useStyle from './style';
import { getFixedBottom, getFixedTop, getTargetRect } from './utils';

// Affix
export interface AffixProps {
  /** Triggered when the specified offset is reached from the top of the window */
  offsetTop?: number;
  /** Triggered when the specified offset is reached from the bottom of the window */
  offsetBottom?: number;
  style?: CSSProperties;
  /** Callback function triggered when fixed state changes */
  onChange?: (affixed?: boolean) => void;
  /** Set the element that Affix needs to listen to its scroll event, the value is a function that returns the corresponding DOM element */
  target?: () => Window | HTMLElement | null;
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
}

type AffixStatus = typeof AFFIX_STATUS_NONE | typeof AFFIX_STATUS_PREPARE;

interface AffixState {
  affixStyle?: CSSProperties;
  placeholderStyle?: CSSProperties;
  status: AffixStatus;
  lastAffix: boolean;
  prevTarget: Window | HTMLElement | null;
}

export interface AffixRef {
  updatePosition: ReturnType<typeof throttleByAnimationFrame>;
}

type InternalAffixProps = AffixProps & { onTestUpdatePosition?: any };

defineOptions({ name: 'Affix', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  style,
  offsetTop,
  offsetBottom,
  prefixCls,
  class: className,
  rootClassName,
  target,
  onChange,
  onTestUpdatePosition,
  ...restProps
} = defineProps<InternalAffixProps>();

const AFFIX_STATUS_NONE = 0;
const AFFIX_STATUS_PREPARE = 1;

const TRIGGER_EVENTS: (keyof WindowEventMap)[] = ['resize', 'scroll', 'touchstart', 'touchmove', 'touchend', 'pageshow', 'load'];

function getDefaultTarget() {
  return typeof window !== 'undefined' ? window : null;
}

const { getPrefixCls, class: contextClassName, style: contextStyle } = toRefs(useComponentConfig('affix'));
const { getTargetContainer } = toRefs(useConfigContextInject());

const affixPrefixCls = computed(() => getPrefixCls?.value?.('affix', prefixCls));

const lastAffix = ref(false);
const affixStyle = ref<CSSProperties>();
const placeholderStyle = ref<CSSProperties>();

const status = ref<AffixStatus>(AFFIX_STATUS_NONE);

const prevTarget = ref<Window | HTMLElement | null>(null);
const prevListener = ref<EventListener>(null);

const placeholderNodeRef = ref<HTMLDivElement>(null);
const fixedNodeRef = ref<HTMLDivElement>(null);
const timer = ref<ReturnType<typeof setTimeout> | null>(null);

const targetFunc = computed(() => target ?? getTargetContainer?.value ?? getDefaultTarget);

const internalOffsetTop = computed(() => (offsetBottom === undefined && offsetTop === undefined ? 0 : offsetTop));

// =================== Measure ===================
const measure = () => {
  if (status.value !== AFFIX_STATUS_PREPARE || !fixedNodeRef.value || !placeholderNodeRef.value || !targetFunc?.value) {
    return;
  }

  const targetNode = targetFunc?.value?.();
  if (targetNode) {
    const newState: Partial<AffixState> = {
      status: AFFIX_STATUS_NONE,
    };
    const placeholderRect = getTargetRect(placeholderNodeRef.value);

    if (placeholderRect.top === 0 && placeholderRect.left === 0 && placeholderRect.width === 0 && placeholderRect.height === 0) {
      return;
    }

    const targetRect = getTargetRect(targetNode);
    const fixedTop = getFixedTop(placeholderRect, targetRect, internalOffsetTop.value);
    const fixedBottom = getFixedBottom(placeholderRect, targetRect, offsetBottom);

    if (fixedTop !== undefined) {
      newState.affixStyle = {
        position: 'fixed',
        top: `${fixedTop}px`,
        width: `${placeholderRect.width}px`,
        height: `${placeholderRect.height}px`,
      };
      newState.placeholderStyle = {
        width: `${placeholderRect.width}px`,
        height: `${placeholderRect.height}px`,
      };
    } else if (fixedBottom !== undefined) {
      newState.affixStyle = {
        position: 'fixed',
        bottom: `${fixedBottom}px`,
        width: `${placeholderRect.width}px`,
        height: `${placeholderRect.height}px`,
      };
      newState.placeholderStyle = {
        width: `${placeholderRect.width}px`,
        height: `${placeholderRect.height}px`,
      };
    }

    newState.lastAffix = !!newState.affixStyle;

    if (lastAffix.value !== newState.lastAffix) {
      onChange?.(newState.lastAffix);
    }

    status.value = newState.status!;
    affixStyle.value = newState.affixStyle;
    placeholderStyle.value = newState.placeholderStyle;
    lastAffix.value = newState.lastAffix;
  }
};

const prepareMeasure = () => {
  status.value = AFFIX_STATUS_PREPARE;
  measure();
  if (process.env.NODE_ENV === 'test') {
    onTestUpdatePosition?.();
  }
};

const updatePosition = throttleByAnimationFrame(() => {
  prepareMeasure();
});

const lazyUpdatePosition = throttleByAnimationFrame(() => {
  // Check position change before measure to make Safari smooth
  if (targetFunc.value && affixStyle.value) {
    const targetNode = targetFunc?.value?.();
    if (targetNode && placeholderNodeRef.value) {
      const targetRect = getTargetRect(targetNode);
      const placeholderRect = getTargetRect(placeholderNodeRef.value);
      const fixedTop = getFixedTop(placeholderRect, targetRect, internalOffsetTop.value);
      const fixedBottom = getFixedBottom(placeholderRect, targetRect, offsetBottom);

      if (
        (fixedTop !== undefined && affixStyle.value.top === fixedTop) ||
        (fixedBottom !== undefined && affixStyle.value.bottom === fixedBottom)
      ) {
        return;
      }
    }
  }

  // Directly call prepare measure since it's already throttled.
  prepareMeasure();
});

const addListeners = () => {
  const listenerTarget = targetFunc?.value?.();
  if (!listenerTarget) {
    return;
  }
  TRIGGER_EVENTS.forEach((eventName) => {
    if (prevListener.value) {
      prevTarget.value?.removeEventListener(eventName, prevListener.value);
    }
    listenerTarget?.addEventListener(eventName, lazyUpdatePosition);
  });
  prevTarget.value = listenerTarget;
  prevListener.value = lazyUpdatePosition;
};

const removeListeners = () => {
  if (timer.value) {
    clearTimeout(timer.value);
    timer.value = null;
  }
  const newTarget = targetFunc?.value?.();
  TRIGGER_EVENTS.forEach((eventName) => {
    newTarget?.removeEventListener(eventName, lazyUpdatePosition);
    if (prevListener.value) {
      prevTarget.value?.removeEventListener(eventName, prevListener.value);
    }
  });
  updatePosition.cancel();
  lazyUpdatePosition.cancel();
};

defineExpose({ updatePosition });

// mount & unmount
onMounted(() => {
  // [Legacy] Wait for parent component ref has its value.
  // We should use target as directly element instead of function which makes element check hard.
  timer.value = setTimeout(addListeners);
});

onBeforeUnmount(() => {
  removeListeners();
});

watch(
  [() => target, affixStyle, lastAffix, () => offsetTop, () => offsetBottom],
  () => {
    addListeners();
  },
  { immediate: true, deep: true },
);

watch(
  [() => target, () => offsetTop, () => offsetBottom],
  () => {
    updatePosition();
  },
  { immediate: true, deep: true },
);

const [hashId, cssVarCls] = useStyle(affixPrefixCls);

const rootCls = computed(() => clsx(rootClassName, hashId.value, affixPrefixCls.value, cssVarCls.value));

const mergedCls = computed(() => clsx({ [rootCls.value]: affixStyle.value }));
</script>
<template>
  <ResizeObserver @resize="updatePosition">
    <div
      :style="{ ...contextStyle, ...style }"
      :class="clsx(className, contextClassName)"
      ref="placeholderNodeRef"
      v-bind="restProps"
    >
      <div v-if="affixStyle" :style="placeholderStyle" aria-hidden="true"></div>
      <div :class="mergedCls" ref="fixedNodeRef" :style="affixStyle">
        <ResizeObserver @resize="updatePosition"><slot></slot></ResizeObserver>
      </div>
    </div>
  </ResizeObserver>
</template>
