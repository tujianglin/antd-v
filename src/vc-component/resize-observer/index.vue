<script lang="tsx" setup>
import findDOMNode from '@/vc-util/Dom/findDOMNode';
import { getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useCollectionContextInject } from './context';
import { observe, unobserve } from './utils/observerUtil';

export interface SizeInfo {
  width: number;
  height: number;
  offsetWidth: number;
  offsetHeight: number;
}
export type OnResize = (size: SizeInfo, element: HTMLElement) => void;
export interface ResizeObserverProps {
  /** Pass to ResizeObserver.Collection with additional data */
  data?: any;
  disabled?: boolean;
  /** Trigger if element resized. Will always trigger when first time render. */
  onResize?: OnResize;
}

defineOptions({ name: 'ResizeObserver', inheritAttrs: false, compatConfig: { MODE: 3 } });

const props = defineProps<ResizeObserverProps>();

const onCollectionResize = useCollectionContextInject();

// ============================= Size =============================
const sizeRef = ref({
  width: -1,
  height: -1,
  offsetWidth: -1,
  offsetHeight: -1,
});

const onInternalResize = (target: HTMLElement) => {
  const { onResize, data } = props;
  const { width, height } = target.getBoundingClientRect();
  const { offsetWidth, offsetHeight } = target;
  /**
   * Resize observer trigger when content size changed.
   * In most case we just care about element size,
   * let's use `boundary` instead of `contentRect` here to avoid shaking.
   */
  const fixedWidth = Math.floor(width);
  const fixedHeight = Math.floor(height);

  if (
    sizeRef.value.width !== fixedWidth ||
    sizeRef.value.height !== fixedHeight ||
    sizeRef.value.offsetWidth !== offsetWidth ||
    sizeRef.value.offsetHeight !== offsetHeight
  ) {
    const size = { width: fixedWidth, height: fixedHeight, offsetWidth, offsetHeight };
    sizeRef.value = size;

    // IE is strange, right?
    const mergedOffsetWidth = offsetWidth === Math.round(width) ? width : offsetWidth;
    const mergedOffsetHeight = offsetHeight === Math.round(height) ? height : offsetHeight;

    const sizeInfo = {
      ...size,
      offsetWidth: mergedOffsetWidth,
      offsetHeight: mergedOffsetHeight,
    };

    // Let collection know what happened
    onCollectionResize?.(sizeInfo, target, data);

    if (onResize) {
      // defer the callback but not defer to next frame
      Promise.resolve().then(() => {
        onResize(sizeInfo, target);
      });
    }
  }
};

const currentElement = ref();
const vm = getCurrentInstance();

const setTargetRef = (el) => {
  currentElement.value = el;
};

const registerObserver = () => {
  if (!currentElement.value) {
    currentElement.value = findDOMNode(vm);
  }
  if (currentElement.value && !props.disabled) {
    observe(currentElement.value, onInternalResize as any);
  } else {
    unobserve(currentElement.value, onInternalResize as any);
  }
};

onMounted(() => {
  registerObserver();
});

watch(
  () => props.disabled,
  async () => {
    await nextTick();
    registerObserver();
  },
  { flush: 'post' },
);

onBeforeUnmount(() => {
  if (currentElement.value) {
    unobserve(currentElement.value, onInternalResize as any);
  }
});

defineExpose({
  get el() {
    return currentElement.value;
  },
});
</script>
<template>
  <slot :ref="setTargetRef"></slot>
</template>
