<!-- eslint-disable vue/define-macros-order -->
<script lang="tsx" setup>
import { getDOM } from '@/vc-util/Dom/findDOMNode';
import getScrollBarSize from '@/vc-util/getScrollBarSize';
import raf from '@/vc-util/raf';
import clsx from 'clsx';
import { computed, onBeforeUnmount, ref, toRefs, watch, type Ref } from 'vue';
import { useTableContextInject } from './context/TableContext';
import { useLayoutState } from './hooks/useFrame';
import { getOffset } from './utils/offsetUtil';

const MOUSEUP_EVENT: keyof WindowEventMap = 'mouseup';
const MOUSEMOVE_EVENT: keyof WindowEventMap = 'mousemove';
const SCROLL_EVENT: keyof WindowEventMap = 'scroll';
const RESIZE_EVENT: keyof WindowEventMap = 'resize';

interface StickyScrollBarProps {
  scrollBodyRef: Ref<HTMLDivElement>;
  onScroll: (params: { scrollLeft?: number }) => void;
  offsetScroll: number;
  container: HTMLElement | Window;
  direction: string | undefined;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { scrollBodyRef, onScroll, offsetScroll, container, direction } = defineProps<StickyScrollBarProps>();

const { prefixCls } = toRefs(useTableContextInject());
const bodyScrollWidth = computed(() => scrollBodyRef.value?.scrollWidth || 0);
const bodyWidth = computed(() => scrollBodyRef.value?.clientWidth || 0);
const scrollBarWidth = computed(() => bodyScrollWidth.value && bodyWidth.value * (bodyWidth.value / bodyScrollWidth.value));

const scrollBarRef = ref<HTMLDivElement>(null);
const [scrollState, setScrollState] = useLayoutState<{
  scrollLeft: number;
  isHiddenScrollBar: boolean;
}>({ scrollLeft: 0, isHiddenScrollBar: true });
const refState = ref<{ delta: number; x: number }>({ delta: 0, x: 0 });
const isActive = ref(false);
const rafRef = ref<number | null>(null);

onBeforeUnmount(() => {
  raf.cancel(rafRef.value);
});

const onMouseup = () => {
  isActive.value = false;
};

const onMousedown = (event: MouseEvent) => {
  event.preventDefault();
  refState.value.delta = event.pageX - scrollState.scrollLeft;
  refState.value.x = 0;
  isActive.value = true;
};

const onMousemove = (event: any) => {
  // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
  const { buttons } = event || (window?.event as any);
  if (!isActive.value || buttons === 0) {
    // If out body mouse up, we can set isActive false when mouse move
    if (isActive.value) {
      isActive.value = false;
    }
    return;
  }
  let left = refState.value.x + event.pageX - refState.value.x - refState.value.delta;

  const isRTL = direction === 'rtl';
  // Limit scroll range
  left = Math.max(
    isRTL ? scrollBarWidth.value - bodyWidth.value : 0,
    Math.min(isRTL ? 0 : bodyWidth.value - scrollBarWidth.value, left),
  );
  // Calculate the scroll position and update
  const shouldScroll = !isRTL || Math.abs(left) + Math.abs(scrollBarWidth.value) < bodyWidth.value;
  if (shouldScroll) {
    onScroll({
      scrollLeft: (left / bodyWidth.value) * (bodyScrollWidth.value + 2),
    });
    refState.value.x = event.pageX;
  }
};

const checkScrollBarVisible = () => {
  raf.cancel(rafRef.value);

  rafRef.value = raf(() => {
    if (!scrollBodyRef.value) {
      return;
    }
    const tableOffsetTop = getOffset(scrollBodyRef.value).top;
    const tableBottomOffset = tableOffsetTop + scrollBodyRef.value.offsetHeight;
    const currentClientOffset =
      container === window
        ? document.documentElement.scrollTop + window.innerHeight
        : getOffset(container).top + (container as HTMLElement).clientHeight;

    if (tableBottomOffset - getScrollBarSize() <= currentClientOffset || tableOffsetTop >= currentClientOffset - offsetScroll) {
      setScrollState((state) => ({
        ...state,
        isHiddenScrollBar: true,
      }));
    } else {
      setScrollState((state) => ({
        ...state,
        isHiddenScrollBar: false,
      }));
    }
  });
};

const setScrollLeft = (left: number) => {
  setScrollState((state) => {
    return {
      ...state,
      scrollLeft: (left / bodyScrollWidth.value) * bodyWidth.value || 0,
    };
  });
};

defineExpose({
  setScrollLeft,
  checkScrollBarVisible,
});

watch(
  [scrollBarWidth, isActive],
  (_, _1, cleanup) => {
    document.body.addEventListener(MOUSEUP_EVENT, onMouseup, false);
    document.body.addEventListener(MOUSEMOVE_EVENT, onMousemove, false);
    checkScrollBarVisible();
    cleanup(() => {
      document.body.removeEventListener(MOUSEUP_EVENT, onMouseup);
      document.body.removeEventListener(MOUSEMOVE_EVENT, onMousemove);
    });
  },
  { immediate: true },
);

// Loop for scroll event check
watch(
  () => container,
  (_, _1, cleanup) => {
    if (scrollBodyRef.value) {
      const scrollParents: (HTMLElement | SVGElement)[] = [];
      let parent = getDOM(scrollBodyRef.value);
      while (parent) {
        scrollParents.push(parent);
        parent = parent.parentElement;
      }
      scrollParents.forEach((p) => {
        p.addEventListener(SCROLL_EVENT, checkScrollBarVisible, false);
      });
      window.addEventListener(RESIZE_EVENT, checkScrollBarVisible, false);
      window.addEventListener(SCROLL_EVENT, checkScrollBarVisible, false);
      container.addEventListener(SCROLL_EVENT, checkScrollBarVisible, false);
      cleanup(() => {
        scrollParents.forEach((p) => {
          p.removeEventListener(SCROLL_EVENT, checkScrollBarVisible);
        });
        window.removeEventListener(RESIZE_EVENT, checkScrollBarVisible);
        window.removeEventListener(SCROLL_EVENT, checkScrollBarVisible);
        container.removeEventListener(SCROLL_EVENT, checkScrollBarVisible);
      });
    }
  },
  { immediate: true, deep: true },
);

watch(
  () => scrollState.isHiddenScrollBar,
  () => {
    if (!scrollState.isHiddenScrollBar) {
      setScrollState((state) => {
        const bodyNode = scrollBodyRef.value;
        if (!bodyNode) {
          return state;
        }
        return {
          ...state,
          scrollLeft: (bodyNode.scrollLeft / bodyNode.scrollWidth) * bodyNode.clientWidth,
        };
      });
    }
  },
);
</script>
<template>
  <template v-if="bodyScrollWidth <= bodyWidth || !scrollBarWidth || scrollState.isHiddenScrollBar"></template>
  <div
    v-else
    :style="{ height: `${getScrollBarSize()}px`, width: `${bodyWidth}px`, bottom: `${offsetScroll}px` }"
    :class="`${prefixCls}-sticky-scroll`"
  >
    <div
      @mousedown="onMousedown"
      ref="scrollBarRef"
      :class="
        clsx(`${prefixCls}-sticky-scroll-bar`, {
          [`${prefixCls}-sticky-scroll-bar-active`]: isActive,
        })
      "
      :style="{
        width: `${scrollBarWidth}px`,
        transform: `translate3d(${scrollState.scrollLeft}px, 0, 0)`,
      }"
    ></div>
  </div>
</template>
