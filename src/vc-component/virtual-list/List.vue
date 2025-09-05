<script lang="tsx" setup generic="T">
import { Render } from '@/components';
import { falseToUndefined } from '@/vc-util/props';
import clsx from 'clsx';
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, toRaw, watch, watchEffect, type CSSProperties } from 'vue';
import ResizeObserver, { type ResizeObserverProps } from '../resize-observer';
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
const itemKeyRef = shallowRef((_item: Record<string, any>) => undefined);
watch(
  () => itemKey,
  (val) => {
    if (typeof val === 'function') {
      itemKeyRef.value = val as any;
    } else {
      itemKeyRef.value = (item) => item?.[val];
    }
  },
  { immediate: true },
);
const getKey = (item: Record<string, any>) => {
  return itemKeyRef.value(item);
};

const dataRef = computed<T[]>(() => data || EMPTY_DATA);
const mergedData = shallowRef([]);

watch(
  dataRef,
  () => {
    mergedData.value = toRaw(dataRef.value).slice();
  },
  { immediate: true },
);
// ================================ Height ================================
const [setInstanceRef, collectHeight, heights, heightUpdatedMark] = useHeights(mergedData, getKey, null, null);

// ================================= MISC =================================
const useVirtual = computed(() => !!(virtual && height && itemHeight));
const containerHeight = computed(() => Object.values(heights.maps).reduce((total, curr) => total + curr, 0));
const inVirtual = computed(
  () => useVirtual.value && data && (Math.max(itemHeight * data.length, containerHeight.value) > height || !!scrollWidth),
);
const isRTL = computed(() => direction === 'rtl');

const mergedClassName = computed(() => clsx(prefixCls, { [`${prefixCls}-rtl`]: isRTL }, className));
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

function syncScrollTop(newTop: number | ((prev: number) => number)) {
  let value: number;
  if (typeof newTop === 'function') {
    value = newTop(offsetTop.value);
  } else {
    value = newTop;
  }

  const alignedTop = keepInRange(value);

  if (componentRef.value) {
    componentRef.value.scrollTop = alignedTop;
  }
  offsetTop.value = alignedTop;
}

// ================================ Legacy ================================
// Put ref here since the range is generate by follow
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
const [diffItem] = useDiffItem<T>(mergedData, getKey);
watch(
  () => diffItem.value,
  (val) => {
    diffItemRef.value = val;
  },
  { immediate: true, deep: true },
);

// ========================== Visible Calculation =========================
const scrollHeight = ref();
const start = ref(0);
const end = ref(0);
const fillerOffset = ref();
watch(
  [inVirtual, useVirtual, offsetTop, mergedData, heightUpdatedMark, () => height],
  () => {
    if (!useVirtual.value) {
      scrollHeight.value = undefined;
      start.value = 0;
      end.value = mergedData.value.length - 1;
      fillerOffset.value = undefined;
      return;
    }

    // Always use virtual scroll bar in avoid shaking
    if (!inVirtual.value) {
      scrollHeight.value = fillerInnerRef.value?.el?.offsetHeight || 0;
      start.value = 0;
      end.value = mergedData.value.length - 1;
      fillerOffset.value = undefined;
      return;
    }

    let itemTop = 0;
    let startIndex: number | undefined;
    let startOffset: number | undefined;
    let endIndex: number | undefined;
    const dataLen = mergedData.value.length;
    const data = mergedData.value;
    const scrollTop = offsetTop.value;
    const scrollTopHeight = scrollTop + height;
    for (let i = 0; i < dataLen; i += 1) {
      const item = data[i];
      const key = getKey(item);

      let cacheHeight = heights.get(key);
      if (cacheHeight === undefined) {
        cacheHeight = itemHeight;
      }
      const currentItemBottom = itemTop + cacheHeight;

      if (startIndex === undefined && currentItemBottom >= scrollTop) {
        startIndex = i;
        startOffset = itemTop;
      }

      // Check item bottom in the range. We will render additional one item for motion usage
      if (endIndex === undefined && currentItemBottom > scrollTopHeight) {
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
      endIndex = dataLen - 1;
    }
    // Give cache to improve scroll experience
    endIndex = Math.min(endIndex + 1, dataLen);
    scrollHeight.value = itemTop;
    start.value = startIndex;
    end.value = endIndex;
    fillerOffset.value = startOffset;
  },
  { immediate: true },
);

watch(
  [start, end],
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
    const changedRecord = heights.getRecord();
    if (changedRecord.size === 1) {
      const recordKey = Array.from(changedRecord.keys())[0];
      const prevCacheHeight = changedRecord.get(recordKey);

      // Quick switch data may cause `start` not in `mergedData` anymore
      const startItem = mergedData.value[start.value];
      if (startItem && prevCacheHeight === undefined) {
        const startIndexKey = getKey(startItem);
        if (startIndexKey === recordKey) {
          const realStartHeight = heights.get(recordKey);
          const diffHeight = realStartHeight - itemHeight;
          syncScrollTop((ori) => {
            return ori + diffHeight;
          });
        }
      }
    }

    heights.resetRecord();
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
const removeEventListener = () => {
  if (componentRef.value) {
    componentRef.value.removeEventListener('wheel', onRawWheel as any);
    componentRef.value.removeEventListener('DOMMouseScroll', onFireFoxScroll as any);
    componentRef.value.removeEventListener('MozMousePixelScroll', onMozMousePixelScroll as any);
  }
};
watchEffect(() => {
  nextTick(() => {
    if (componentRef.value) {
      removeEventListener();
      componentRef.value.addEventListener('wheel', onRawWheel, { passive: false });
      componentRef.value.addEventListener('DOMMouseScroll', onFireFoxScroll as any);
      componentRef.value.addEventListener('MozMousePixelScroll', onMozMousePixelScroll as any);
    }
  });
});

onBeforeUnmount(() => {
  removeEventListener();
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
  () => collectHeight(),
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
      // Scroll again to fix
      setTimeout(() => {
        scrollTo(config);
      });
    }
  },
});

// ================================ Effect ================================
/** We need told outside that some list not rendered */
watch(
  [start, end, mergedData],
  async () => {
    await nextTick();
    if (onVisibleChange) {
      const renderList = mergedData.value.slice(start.value, end.value + 1);

      onVisibleChange(renderList, mergedData.value);
    }
  },
  { flush: 'post' },
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
            :content="useChildren(mergedData, start, end, scrollWidth, offsetLeft, setInstanceRef, $slots.default, sharedConfig)"
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
