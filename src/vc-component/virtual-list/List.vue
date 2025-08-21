<script lang="tsx" setup generic="T">
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, nextTick, onBeforeUnmount, ref, toRefs, watch, type CSSProperties } from 'vue';
import { Render } from '../../components';
import { falseToUndefined } from '../../vc-util/props';
import type { ResizeObserverProps } from '../resize-observer';
import ResizeObserver from '../resize-observer';
import Filler from './Filler.vue';
import useChildren from './hooks/useChildren';
import useDiffItem from './hooks/useDiffItem';
import useFrameWheel from './hooks/useFrameWheel';
import { useGetSize } from './hooks/useGetSize';
import useHeights from './hooks/useHeights';
import useMobileTouchMove from './hooks/useMobileTouchMove';
import useOriginScroll from './hooks/useOriginScroll';
import useScrollDrag from './hooks/useScrollDrag';
import useScrollTo, { type ScrollPos } from './hooks/useScrollTo';
import type { ListProps, SharedConfig } from './interface';
import type { ScrollBarRef } from './ScrollBar.vue';
import ScrollBar from './ScrollBar.vue';
import { getSpinSize } from './utils/scrollbarUtil';

defineOptions({ name: 'List', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls = 'rc-virtual-list',
  class: className,
  height,
  itemHeight,
  fullHeight = true,
  style,
  data,
  itemKey,
  virtual = true,
  direction,
  scrollWidth,
  component: Component = 'div',
  onScroll,
  onVirtualScroll,
  onVisibleChange,
  innerProps,
  extraRender,
  styles,
  showScrollBar = 'optional',
  ...restProps
} = defineProps<ListProps<T>>();

defineSlots<{ default: (data: { item: T; index: number; props: { style: CSSProperties; offsetX: number } }) => any }>();

const EMPTY_DATA = [];
const ScrollStyle: CSSProperties = {
  overflowY: 'auto',
  overflowAnchor: 'none',
};

// =============================== Item Key ===============================
const getKey = (item: T) => {
  if (typeof itemKey === 'function') {
    return itemKey(item);
  }
  return item?.[itemKey as string];
};

// ================================ Height ================================
const [setInstanceRef, collectHeight, heights, heightUpdatedMark] = useHeights(getKey, null, null);

// ================================= MISC =================================
const useVirtual = computed(() => {
  return !!(virtual && height && itemHeight);
});
const containerHeight = computed(() => {
  // eslint-disable-next-line no-unused-expressions
  heights.value?.id;
  return Object.values(heights.value?.maps).reduce((total, curr) => total + curr, 0);
});

const inVirtual = computed(() => {
  return useVirtual.value && data && (Math.max(itemHeight * data.length, containerHeight.value) > height || !!scrollWidth);
});

const isRTL = computed(() => direction === 'rtl');

const mergedClassName = computed(() => clsx(prefixCls, { [`${prefixCls}-rtl`]: isRTL.value }, className));
const mergedData = computed(() => data || EMPTY_DATA);
const componentRef = ref<HTMLDivElement>();
const fillerInnerRef = ref();
const containerRef = ref<HTMLDivElement>();

// =============================== Item Key ===============================

const offsetTop = ref(0);
const offsetLeft = ref(0);
const scrollMoving = ref(false);

const onScrollbarStartMove = () => {
  scrollMoving.value = true;
};
const onScrollbarStopMove = () => {
  scrollMoving.value = false;
};

const sharedConfig: SharedConfig<T> = {
  getKey,
};

// ================================ Scroll ================================
function syncScrollTop(newTop: number | ((prev: number) => number)) {
  let value: number;
  if (typeof newTop === 'function') {
    value = newTop(offsetTop.value);
  } else {
    value = newTop;
  }

  const alignedTop = keepInRange(value);

  componentRef.value.scrollTop = alignedTop;
  offsetTop.value = alignedTop;
}

// ================================ Legacy ================================
// Put ref here since the range is generate by follow
const rangeRef = ref({ start: 0, end: 0 });
watch(
  () => mergedData.value?.length,
  (val) => {
    rangeRef.value.end = val;
  },
  { immediate: true },
);

const diffItemRef = ref<T>();
const [diffItem] = useDiffItem(mergedData, getKey);
watch(
  () => diffItem.value,
  (val) => {
    diffItemRef.value = val;
  },
  { immediate: true, deep: true },
);

// ========================== Visible Calculation =========================
const {
  scrollHeight,
  start,
  end,
  offset: fillerOffset,
} = toRefs(
  reactiveComputed(() => {
    // eslint-disable-next-line no-unused-expressions
    heightUpdatedMark.value;
    // eslint-disable-next-line no-unused-expressions
    height;
    if (!useVirtual.value) {
      return {
        scrollHeight: undefined,
        start: 0,
        end: mergedData.value.length - 1,
        offset: undefined,
      };
    }

    // Always use virtual scroll bar in avoid shaking
    if (!inVirtual.value) {
      return {
        scrollHeight: fillerInnerRef.value?.el?.offsetHeight || 0,
        start: 0,
        end: mergedData.value.length - 1,
        offset: undefined,
      };
    }

    let itemTop = 0;
    let startIndex: number;
    let startOffset: number;
    let endIndex: number;

    const dataLen = mergedData.value.length;
    for (let i = 0; i < dataLen; i += 1) {
      const item = mergedData.value[i];
      const key = getKey(item);

      const cacheHeight = heights.value.get(key);
      const currentItemBottom = itemTop + (cacheHeight === undefined ? itemHeight : cacheHeight);

      // Check item top in the range
      if (currentItemBottom >= offsetTop.value && startIndex === undefined) {
        startIndex = i;
        startOffset = itemTop;
      }

      // Check item bottom in the range. We will render additional one item for motion usage
      if (currentItemBottom > offsetTop.value + height && endIndex === undefined) {
        endIndex = i;
      }

      itemTop = currentItemBottom;
    }

    // When scrollTop at the end but data cut to small count will reach this
    if (startIndex === undefined) {
      startIndex = 0;
      startOffset = 0;

      endIndex = Math.ceil(height / itemHeight);
    }
    if (endIndex === undefined) {
      endIndex = mergedData.value.length - 1;
    }

    // Give cache to improve scroll experience
    endIndex = Math.min(endIndex + 1, mergedData.value.length - 1);

    return {
      scrollHeight: itemTop,
      start: startIndex,
      end: endIndex,
      offset: startOffset,
    };
  }),
);

watch(
  [() => start.value, () => end.value],
  () => {
    rangeRef.value.start = start.value;
    rangeRef.value.end = end.value;
  },
  { immediate: true },
);

// When scroll up, first visible item get real height may not same as `itemHeight`,
// Which will make scroll jump.
// Let's sync scroll top to avoid jump
watch(
  () => scrollHeight.value,
  async () => {
    await nextTick();
    const changedRecord = heights.value.getRecord();
    if (changedRecord.size === 1) {
      const recordKey = Array.from(changedRecord.keys())[0];
      const prevCacheHeight = changedRecord.get(recordKey);

      // Quick switch data may cause `start` not in `mergedData` anymore
      const startItem = mergedData.value[start.value];
      if (startItem && prevCacheHeight === undefined) {
        const startIndexKey = getKey(startItem);
        if (startIndexKey === recordKey) {
          const realStartHeight = heights.value.get(recordKey);
          const diffHeight = realStartHeight - itemHeight;
          syncScrollTop((ori) => {
            return ori + diffHeight;
          });
        }
      }
    }

    heights.value.resetRecord();
  },
  { flush: 'post', immediate: true },
);

// ================================= Size =================================
const size = ref({ width: 0, height });
watch(
  () => height,
  (val) => {
    size.value.height = val;
  },
  { immediate: true },
);

const onHolderResize: ResizeObserverProps['onResize'] = (sizeInfo) => {
  size.value = {
    width: sizeInfo.offsetWidth,
    height: sizeInfo.offsetHeight,
  };
};

// Hack on scrollbar to enable flash call
const verticalScrollBarRef = ref<ScrollBarRef>();
const horizontalScrollBarRef = ref<ScrollBarRef>();

const horizontalScrollBarSpinSize = computed(() => getSpinSize(size.value.width, scrollWidth));
const verticalScrollBarSpinSize = computed(() => getSpinSize(size.value.height, scrollHeight.value));

// =============================== In Range ===============================
const maxScrollHeight = computed(() => scrollHeight.value - height);
const maxScrollHeightRef = ref(maxScrollHeight.value);
watch(
  () => maxScrollHeight.value,
  (val) => {
    maxScrollHeightRef.value = val;
  },
  { immediate: true },
);

function keepInRange(newScrollTop: number) {
  let newTop = newScrollTop;
  if (!Number.isNaN(maxScrollHeightRef.value)) {
    newTop = Math.min(newTop, maxScrollHeightRef.value);
  }
  newTop = Math.max(newTop, 0);
  return newTop;
}

const isScrollAtTop = computed(() => offsetTop.value <= 0);
const isScrollAtBottom = computed(() => offsetTop.value >= maxScrollHeight.value);
const isScrollAtLeft = computed(() => offsetLeft.value <= 0);
const isScrollAtRight = computed(() => offsetLeft.value >= scrollWidth);

const originScroll = useOriginScroll(isScrollAtTop, isScrollAtBottom, isScrollAtLeft, isScrollAtRight);

// ================================ Scroll ================================
const getVirtualScrollInfo = () => ({
  x: isRTL.value ? -offsetLeft.value : offsetLeft.value,
  y: offsetTop.value,
});

const lastVirtualScrollInfoRef = ref(getVirtualScrollInfo());

const triggerScroll = (params?: { x?: number; y?: number }) => {
  if (onVirtualScroll) {
    const nextInfo = { ...getVirtualScrollInfo(), ...params };

    // Trigger when offset changed
    if (lastVirtualScrollInfoRef.value.x !== nextInfo.x || lastVirtualScrollInfoRef.value.y !== nextInfo.y) {
      onVirtualScroll(nextInfo);

      lastVirtualScrollInfoRef.value = nextInfo;
    }
  }
};

function onScrollBar(newScrollOffset: number, horizontal?: boolean) {
  const newOffset = newScrollOffset;

  if (horizontal) {
    nextTick(() => {
      offsetLeft.value = newOffset;
    });
    triggerScroll();
  } else {
    syncScrollTop(newOffset);
  }
}

// When data size reduce. It may trigger native scroll event back to fit scroll position
function onFallbackScroll(e: UIEvent) {
  const { scrollTop: newScrollTop } = e.currentTarget as HTMLDivElement;
  if (newScrollTop !== offsetTop.value) {
    syncScrollTop(newScrollTop);
  }

  // Trigger origin onScroll
  onScroll?.(e);
  triggerScroll();
}
const keepInHorizontalRange = (nextOffsetLeft: number) => {
  let tmpOffsetLeft = nextOffsetLeft;
  const max = scrollWidth ? scrollWidth - size.value.width : 0;
  tmpOffsetLeft = Math.max(tmpOffsetLeft, 0);
  tmpOffsetLeft = Math.min(tmpOffsetLeft, max);

  return tmpOffsetLeft;
};

const onWheelDelta: Parameters<typeof useFrameWheel>[6] = (offsetXY, fromHorizontal) => {
  if (fromHorizontal) {
    nextTick(() => {
      const nextOffsetLeft = offsetLeft.value + (isRTL.value ? -offsetXY : offsetXY);
      offsetLeft.value = keepInHorizontalRange(nextOffsetLeft);
    });

    triggerScroll();
  } else {
    syncScrollTop((top) => {
      const newTop = top + offsetXY;

      return newTop;
    });
  }
};

// Since this added in global,should use ref to keep update
const [onRawWheel, onFireFoxScroll] = useFrameWheel(
  useVirtual,
  isScrollAtTop,
  isScrollAtBottom,
  isScrollAtLeft,
  isScrollAtRight,
  computed(() => !!scrollWidth),
  onWheelDelta,
);

// Mobile touch move
useMobileTouchMove(useVirtual, componentRef, (isHorizontal, delta, smoothOffset, e) => {
  const event = e as TouchEvent & {
    _virtualHandled?: boolean;
  };

  if (originScroll(isHorizontal, delta, smoothOffset)) {
    return false;
  }

  // Fix nest List trigger TouchMove event
  if (!event || !event._virtualHandled) {
    if (event) {
      event._virtualHandled = true;
    }

    onRawWheel({
      preventDefault() {},
      deltaX: isHorizontal ? delta : 0,
      deltaY: isHorizontal ? 0 : delta,
    } as WheelEvent);

    return true;
  }

  return false;
});

// MouseDown drag for scroll
useScrollDrag(inVirtual, componentRef, (offset) => {
  syncScrollTop((top) => top + offset);
});

// Firefox only
function onMozMousePixelScroll(e: WheelEvent) {
  // scrolling at top/bottom limit
  const scrollingUpAtTop = isScrollAtTop.value && e.detail < 0;
  const scrollingDownAtBottom = isScrollAtBottom.value && e.detail > 0;
  if (useVirtual.value && !scrollingUpAtTop && !scrollingDownAtBottom) {
    e.preventDefault();
  }
}

watch(
  [() => useVirtual.value, () => isScrollAtTop.value, () => isScrollAtBottom.value],
  async () => {
    await nextTick();

    const componentEle = componentRef.value;
    componentEle?.addEventListener('wheel', onRawWheel, { passive: false });
    componentEle?.addEventListener('DOMMouseScroll', onFireFoxScroll as any, { passive: true });
    componentEle?.addEventListener('MozMousePixelScroll', onMozMousePixelScroll as any, { passive: false });
  },
  { flush: 'post', immediate: true },
);

onBeforeUnmount(() => {
  const componentEle = componentRef.value;
  if (!componentEle) return;
  componentEle.removeEventListener('wheel', onRawWheel);
  componentEle.removeEventListener('DOMMouseScroll', onFireFoxScroll as any);
  componentEle.removeEventListener('MozMousePixelScroll', onMozMousePixelScroll as any);
});

// Sync scroll left
watch(
  [() => size.value.width, () => scrollWidth],
  () => {
    if (scrollWidth) {
      const newOffsetLeft = keepInHorizontalRange(offsetLeft.value);
      offsetLeft.value = newOffsetLeft;
      triggerScroll({ x: newOffsetLeft });
    }
  },
  { immediate: true },
);

// ================================= Ref ==================================
const delayHideScrollBar = () => {
  verticalScrollBarRef.value?.delayHidden();
  horizontalScrollBarRef.value?.delayHidden();
};

const scrollTo = useScrollTo<T>(
  componentRef,
  mergedData,
  heights,
  computed(() => itemHeight),
  getKey,
  () => collectHeight(true),
  syncScrollTop,
  delayHideScrollBar,
);

defineExpose({
  get nativeElement() {
    return containerRef.value;
  },
  getScrollInfo: getVirtualScrollInfo,
  scrollTo: (config) => {
    function isPosScroll(arg: any): arg is ScrollPos {
      return arg && typeof arg === 'object' && ('left' in arg || 'top' in arg);
    }

    if (isPosScroll(config)) {
      // Scroll X
      if (config.left !== undefined) {
        offsetLeft.value = keepInHorizontalRange(config.left);
      }

      // Scroll Y
      scrollTo(config.top);
    } else {
      scrollTo(config);
    }
  },
});

// ================================ Effect ================================
/** We need told outside that some list not rendered */
watch(
  [() => start.value, () => end.value, () => mergedData.value],
  async () => {
    await nextTick();
    if (onVisibleChange) {
      const renderList = mergedData.value.slice(start.value, end.value + 1);

      onVisibleChange(renderList, mergedData.value);
    }
  },
  { flush: 'post', immediate: true },
);

// ================================ Extra =================================
const getSize = useGetSize(
  mergedData,
  getKey,
  heights,
  computed(() => itemHeight),
);

const extraContent = computed(() =>
  extraRender?.({
    start: start.value,
    end: end.value,
    virtual: inVirtual.value,
    offsetX: offsetLeft.value,
    offsetY: fillerOffset.value,
    rtl: isRTL.value,
    getSize,
  }),
);

const componentStyle = computed(() => {
  let result: CSSProperties = null;
  if (height) {
    result = { [fullHeight ? 'height' : 'maxHeight']: `${height}px`, ...ScrollStyle };

    if (useVirtual.value) {
      result.overflowY = 'hidden';

      if (scrollWidth) {
        result.overflowX = 'hidden';
      }

      if (scrollMoving.value) {
        result.pointerEvents = 'none';
      }
    }
  }
  return result;
});

const containerProps = computed(() => {
  if (isRTL.value) {
    return {
      dir: 'rtl',
    };
  }
  return {};
});
</script>
<template>
  <div
    ref="containerRef"
    :style="{
      ...style,
      position: 'relative',
    }"
    :class="mergedClassName"
    v-bind="{ ...containerProps, ...restProps, ...falseToUndefined($attrs) }"
  >
    <ResizeObserver @resize="onHolderResize">
      <component
        :is="Component"
        :class="`${prefixCls}-holder`"
        :style="componentStyle"
        ref="componentRef"
        @scroll.passive="onFallbackScroll"
        @mouseenter="delayHideScrollBar"
      >
        <Filler
          :prefix-cls="prefixCls"
          :height="scrollHeight"
          :offset-x="offsetLeft"
          :offset-y="fillerOffset"
          :scroll-width="scrollWidth"
          @inner-resize="collectHeight"
          ref="fillerInnerRef"
          :inner-props="innerProps"
          :rtl="isRTL"
          :extra="extraContent"
        >
          <Render
            :content="
              useChildren < T > (mergedData, start, end, scrollWidth, offsetLeft, setInstanceRef, $slots.default, sharedConfig)
            "
          />
        </Filler>
      </component>
    </ResizeObserver>
    <ScrollBar
      v-if="inVirtual && scrollHeight > height"
      ref="verticalScrollBarRef"
      :prefix-cls="prefixCls"
      :scroll-offset="offsetTop"
      :scroll-range="scrollHeight"
      :rtl="isRTL"
      @scroll="onScrollBar"
      @start-move="onScrollbarStartMove"
      @stop-move="onScrollbarStopMove"
      :spin-size="verticalScrollBarSpinSize"
      :container-size="size.height"
      :style="styles?.verticalScrollBar"
      :thumb-style="styles?.verticalScrollBarThumb"
      :show-scroll-bar="showScrollBar"
    />
    <ScrollBar
      v-if="inVirtual && scrollWidth > size.width"
      ref="horizontalScrollBarRef"
      :prefix-cls="prefixCls"
      :scroll-offset="offsetLeft"
      :scroll-range="scrollWidth"
      :rtl="isRTL"
      @scroll="onScrollBar"
      @start-move="onScrollbarStartMove"
      @stop-move="onScrollbarStopMove"
      :spin-size="horizontalScrollBarSpinSize"
      :container-size="size.width"
      horizontal
      :style="styles?.horizontalScrollBar"
      :thumb-style="styles?.horizontalScrollBarThumb"
      :show-scroll-bar="showScrollBar"
    />
  </div>
</template>
