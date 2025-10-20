import type { ReactiveComputedReturn } from '@vueuse/core';
import { clsx } from 'clsx';
import { computed, onBeforeUnmount, ref, toRefs, watch, type ComputedRef, type CSSProperties, type Ref } from 'vue';
import type { Placement } from '../Drawer.vue';

export interface UseDragOptions {
  prefixCls: string;
  direction: Placement;
  class?: string;
  style?: CSSProperties;
  maxSize?: number;
  containerRef?: Ref<HTMLElement>;
  currentSize?: number | string;
  onResize?: (size: number) => void;
  onResizeEnd?: (size: number) => void;
  onResizeStart?: (size: number) => void;
}

export interface UseDragReturn {
  dragElementProps: ComputedRef<{
    class: string;
    style: CSSProperties;
    onMousedown: (e: MouseEvent) => void;
  }>;
  isDragging: Ref<boolean>;
}

export default function useDrag(options: ReactiveComputedReturn<UseDragOptions>): UseDragReturn {
  const {
    prefixCls,
    direction,
    class: className,
    style,
    maxSize,
    containerRef,
    currentSize,
    onResize,
    onResizeEnd,
    onResizeStart,
  } = toRefs(options);

  const isDragging = ref<boolean>(false);
  const startPos = ref<number>(0);
  const startSize = ref<number>(0);

  const isHorizontal = computed(() => direction?.value === 'left' || direction?.value === 'right');

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    isDragging.value = true;

    if (isHorizontal) {
      startPos.value = e.clientX;
    } else {
      startPos.value = e.clientY;
    }

    // Use provided currentSize, or fallback to container size
    let sSize: number;
    if (typeof currentSize.value === 'number') {
      sSize = currentSize.value;
    } else if (containerRef?.value) {
      const rect = containerRef?.value?.getBoundingClientRect();
      sSize = isHorizontal ? rect.width : rect.height;
    }

    startSize.value = sSize;
    onResizeStart?.value?.(sSize);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return;

    const currentPos = isHorizontal.value ? e.clientX : e.clientY;
    let delta = currentPos - startPos.value;

    // Adjust delta direction based on placement
    if (direction.value === 'right' || direction.value === 'bottom') {
      delta = -delta;
    }

    let newSize = startPos.value + delta;

    // Apply min/max size limits
    if (newSize < 0) {
      newSize = 0;
    }
    // Only apply maxSize if it's a valid positive number
    if (maxSize.value && newSize > maxSize.value) {
      newSize = maxSize.value;
    }

    onResize?.value?.(newSize);
  };

  const handleMouseUp = () => {
    if (isDragging.value) {
      isDragging.value = false;

      // Get the final size after resize
      if (containerRef?.value) {
        const rect = containerRef?.value?.getBoundingClientRect();
        const finalSize = isHorizontal ? rect.width : rect.height;
        onResizeEnd?.value?.(finalSize);
      }
    }
  };

  watch(
    isDragging,
    () => {
      if (isDragging.value) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  });

  const dragElementClassName = clsx(
    `${prefixCls.value}-dragger`,
    `${prefixCls.value}-dragger-${direction.value}`,
    {
      [`${prefixCls.value}-dragger-dragging`]: isDragging.value,
      [`${prefixCls.value}-dragger-horizontal`]: isHorizontal.value,
      [`${prefixCls.value}-dragger-vertical`]: !isHorizontal.value,
    },
    className.value,
  );

  return {
    dragElementProps: computed(() => ({
      class: dragElementClassName,
      style: style.value,
      onMousedown: handleMouseDown,
    })),
    isDragging,
  };
}
