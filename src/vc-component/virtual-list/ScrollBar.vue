<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch, type CSSProperties } from 'vue';
import raf from '../../vc-util/raf';
import { getPageXY } from './hooks/useScrollDrag';

export type ScrollBarDirectionType = 'ltr' | 'rtl';

export interface ScrollBarProps {
  prefixCls: string;
  scrollOffset: number;
  scrollRange: number;
  rtl: boolean;
  onScroll: (scrollOffset: number, horizontal?: boolean) => void;
  onStartMove: () => void;
  onStopMove: () => void;
  horizontal?: boolean;
  style?: CSSProperties;
  thumbStyle?: CSSProperties;
  spinSize: number;
  containerSize: number;
  showScrollBar?: boolean | 'optional';
}

export interface ScrollBarRef {
  delayHidden: () => void;
}

defineOptions({ name: 'ScrollBar', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  rtl,
  scrollOffset,
  scrollRange,
  onStartMove,
  onStopMove,
  onScroll,
  horizontal,
  spinSize,
  containerSize,
  style,
  thumbStyle: propsThumbStyle,
  showScrollBar,
} = defineProps<ScrollBarProps>();

const dragging = ref(false);
const pageXY = ref<number | null>(null);
const startTop = ref<number | null>(null);

const isLTR = computed(() => !rtl);

// ========================= Refs =========================
const scrollbarRef = ref<HTMLDivElement>();
const thumbRef = ref<HTMLDivElement>();

// ======================= Visible ========================
const visible = ref();
watch(
  () => showScrollBar,
  (val) => {
    visible.value = val;
  },
  { immediate: true },
);
const visibleTimeoutRef = ref<ReturnType<typeof setTimeout>>();

const delayHidden = () => {
  if (showScrollBar === true || showScrollBar === false) return;
  clearTimeout(visibleTimeoutRef.value);
  visible.value = true;
  visibleTimeoutRef.value = setTimeout(() => {
    visible.value = false;
  }, 3000);
};

// ======================== Range =========================
const enableScrollRange = computed(() => scrollRange - containerSize || 0);
const enableOffsetRange = computed(() => containerSize - spinSize || 0);

// ========================= Top ==========================
const top = computed(() => {
  if (scrollOffset === 0 || enableScrollRange.value === 0) {
    return 0;
  }
  const ptg = scrollOffset / enableScrollRange.value;
  return ptg * enableOffsetRange.value;
});

// ====================== Container =======================
const onContainerMouseDown = (e: MouseEvent) => {
  e.stopPropagation();
  e.preventDefault();
};

// ======================== Thumb =========================
const stateRef = ref({ top: top.value, dragging: dragging.value, pageY: pageXY.value, startTop: startTop.value });
watch(
  [() => top.value, () => dragging.value, () => pageXY.value, () => startTop.value],
  ([val1, val2, val3, val4]) => {
    stateRef.value = { top: val1, dragging: val2, pageY: val3, startTop: val4 };
  },
  { immediate: true },
);

const onThumbMouseDown = (e: MouseEvent | TouchEvent) => {
  dragging.value = true;
  pageXY.value = getPageXY(e, horizontal);
  startTop.value = stateRef.value.top;
  onStartMove();
  e.stopPropagation();
  e.preventDefault();
};

// ======================== Effect ========================

// React make event as passive, but we need to preventDefault
// Add event on dom directly instead.
// ref: https://github.com/facebook/react/issues/9809

const onScrollbarTouchStart = (e: TouchEvent) => {
  e.preventDefault();
};
onMounted(() => {
  const scrollbarEle = scrollbarRef.value;
  const thumbEle = thumbRef.value;
  scrollbarEle?.addEventListener('touchstart', onScrollbarTouchStart, { passive: false });
  thumbEle?.addEventListener('touchstart', onThumbMouseDown, { passive: false });
});

onBeforeUnmount(() => {
  clearTimeout(visibleTimeoutRef.value);
  const scrollbarEle = scrollbarRef.value;
  const thumbEle = thumbRef.value;
  scrollbarEle?.removeEventListener('touchstart', onScrollbarTouchStart);
  thumbEle?.removeEventListener('touchstart', onThumbMouseDown);
});

// Pass to effect
const enableScrollRangeRef = ref<number>();
watch(
  () => enableScrollRange.value,
  (val) => {
    enableScrollRangeRef.value = val;
  },
  { immediate: true },
);
const enableOffsetRangeRef = ref<number>();
watch(
  () => enableOffsetRange.value,
  (val) => {
    enableOffsetRangeRef.value = val;
  },
  { immediate: true },
);

let onMouseMove, onMouseUp;
let moveRafId: number;

watch(
  () => dragging.value,
  () => {
    if (dragging.value) {
      onMouseMove = (e: MouseEvent | TouchEvent) => {
        const { dragging: stateDragging, pageY: statePageY, startTop: stateStartTop } = stateRef.value;
        raf.cancel(moveRafId);

        const rect = scrollbarRef.value.getBoundingClientRect();
        const scale = containerSize / (horizontal ? rect.width : rect.height);

        if (stateDragging) {
          const offset = (getPageXY(e, horizontal) - statePageY) * scale;
          let newTop = stateStartTop;

          if (!isLTR.value && horizontal) {
            newTop -= offset;
          } else {
            newTop += offset;
          }

          const tmpEnableScrollRange = enableScrollRangeRef.value;
          const tmpEnableOffsetRange = enableOffsetRangeRef.value;

          const ptg: number = tmpEnableOffsetRange ? newTop / tmpEnableOffsetRange : 0;

          let newScrollTop = Math.ceil(ptg * tmpEnableScrollRange);
          newScrollTop = Math.max(newScrollTop, 0);
          newScrollTop = Math.min(newScrollTop, tmpEnableScrollRange);

          moveRafId = raf(() => {
            onScroll(newScrollTop, horizontal);
          });
        }
      };

      onMouseUp = () => {
        dragging.value = false;

        onStopMove();
      };

      window.addEventListener('mousemove', onMouseMove, { passive: true });
      window.addEventListener('touchmove', onMouseMove, { passive: true });
      window.addEventListener('mouseup', onMouseUp, { passive: true });
      window.addEventListener('touchend', onMouseUp, { passive: true });
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (dragging.value) {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('touchmove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('touchend', onMouseUp);

    raf.cancel(moveRafId);
  }
});

watch(
  () => scrollOffset,
  () => {
    delayHidden();
  },
  { immediate: true },
);

// ====================== Imperative ======================
defineExpose({
  delayHidden,
});

// ======================== Render ========================
const scrollbarPrefixCls = `${prefixCls}-scrollbar`;

const { containerStyle, thumbStyle } = toRefs(
  reactiveComputed(() => {
    const container: CSSProperties = {
      position: 'absolute',
      visibility: visible.value ? null : 'hidden',
    };

    const thumb: CSSProperties = {
      position: 'absolute',
      borderRadius: '99px',
      background: 'var(--rc-virtual-list-scrollbar-bg, rgba(0, 0, 0, 0.5))',
      cursor: 'pointer',
      userSelect: 'none',
    };

    if (horizontal) {
      Object.assign(container, {
        height: '8px',
        left: 0,
        right: 0,
        bottom: 0,
      });

      Object.assign(thumb, {
        height: '100%',
        width: `${spinSize}px`,
        [isLTR.value ? 'left' : 'right']: `${top.value}px`,
      });
    } else {
      Object.assign(container, {
        width: '8px',
        top: 0,
        bottom: 0,
        [isLTR.value ? 'right' : 'left']: 0,
      });

      Object.assign(thumb, {
        width: '100%',
        height: `${spinSize}px`,
        top: `${top.value}px`,
      });
    }
    return { containerStyle: container, thumbStyle: thumb };
  }),
);
</script>
<template>
  <div
    ref="scrollbarRef"
    :class="
      clsx(scrollbarPrefixCls, {
        [`${scrollbarPrefixCls}-horizontal`]: horizontal,
        [`${scrollbarPrefixCls}-vertical`]: !horizontal,
        [`${scrollbarPrefixCls}-visible`]: visible,
      })
    "
    :style="{ ...containerStyle, ...style }"
    @mousedown="onContainerMouseDown"
    @mousemove="delayHidden"
  >
    <div
      ref="thumbRef"
      :class="
        clsx(`${scrollbarPrefixCls}-thumb`, {
          [`${scrollbarPrefixCls}-thumb-moving`]: dragging,
        })
      "
      :style="{ ...thumbStyle, ...propsThumbStyle }"
      @mousedown="onThumbMouseDown"
    ></div>
  </div>
</template>
