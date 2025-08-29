<script lang="tsx" setup>
import CSSMotion from '@/vc-component/motion';
import { composeRef } from '@/vc-util/ref';
import clsx from 'clsx';
import { computed, nextTick, ref, watch } from 'vue';
import type { SegmentedValue } from './index.vue';

type ThumbReact = {
  left: number;
  right: number;
  width: number;
  top: number;
  bottom: number;
  height: number;
} | null;

export interface MotionThumbInterface {
  containerRef: HTMLDivElement;
  value?: SegmentedValue;
  getValueIndex: (value: SegmentedValue) => number;
  prefixCls: string;
  motionName: string;
  onMotionStart: VoidFunction;
  onMotionEnd: VoidFunction;
  direction?: 'ltr' | 'rtl';
  vertical?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  containerRef,
  prefixCls,
  value,
  getValueIndex,
  motionName,
  onMotionStart,
  onMotionEnd,
  direction,
  vertical = false,
} = defineProps<MotionThumbInterface>();

const calcThumbStyle = (targetElement: HTMLElement | null | undefined, vertical?: boolean): ThumbReact => {
  if (!targetElement) return null;

  const style: ThumbReact = {
    left: targetElement.offsetLeft,
    right: (targetElement.parentElement!.clientWidth as number) - targetElement.clientWidth - targetElement.offsetLeft,
    width: targetElement.clientWidth,
    top: targetElement.offsetTop,
    bottom: (targetElement.parentElement!.clientHeight as number) - targetElement.clientHeight - targetElement.offsetTop,
    height: targetElement.clientHeight,
  };

  if (vertical) {
    // Adjusts positioning and size for vertical layout by setting horizontal properties to 0 and using vertical properties from the style object.
    return {
      left: 0,
      right: 0,
      width: 0,
      top: style.top,
      bottom: style.bottom,
      height: style.height,
    };
  }

  return {
    left: style.left,
    right: style.right,
    width: style.width,
    top: 0,
    bottom: 0,
    height: 0,
  };
};

const toPX = (value: number | undefined): string | undefined => (value !== undefined ? `${value}px` : undefined);

const thumbRef = ref<HTMLDivElement>(null);
const prevValue = ref(value);

// =========================== Effect ===========================
const findValueElement = (val: SegmentedValue) => {
  const index = getValueIndex(val);
  const ele = containerRef?.querySelectorAll<HTMLDivElement>(`.${prefixCls}-item`)[index];
  return ele?.offsetParent && ele;
};

const prevStyle = ref<ThumbReact>(null);
const nextStyle = ref<ThumbReact>(null);

watch(
  () => value,
  async () => {
    await nextTick();
    if (prevValue.value !== value) {
      const prev = findValueElement(prevValue.value);
      const next = findValueElement(value);

      const calcPrevStyle = calcThumbStyle(prev, vertical);
      const calcNextStyle = calcThumbStyle(next, vertical);

      prevValue.value = value;
      prevStyle.value = calcPrevStyle;
      nextStyle.value = calcNextStyle;

      if (prev && next) {
        onMotionStart();
      } else {
        onMotionEnd();
      }
    }
  },
  { immediate: true, flush: 'post' },
);

const thumbStart = computed(() => {
  if (vertical) {
    return toPX(prevStyle.value?.top ?? 0);
  }

  if (direction === 'rtl') {
    return toPX(-(prevStyle.value?.right as number));
  }

  return toPX(prevStyle.value?.left as number);
});

const thumbActive = computed(() => {
  if (vertical) {
    return toPX(nextStyle.value?.top ?? 0);
  }

  if (direction === 'rtl') {
    return toPX(-(nextStyle.value?.right as number));
  }

  return toPX(nextStyle.value?.left as number);
});

// =========================== Motion ===========================
const onAppearStart = () => {
  if (vertical) {
    return {
      transform: 'translateY(var(--thumb-start-top))',
      height: 'var(--thumb-start-height)',
    };
  }

  return {
    transform: 'translateX(var(--thumb-start-left))',
    width: 'var(--thumb-start-width)',
  };
};

const onAppearActive = () => {
  if (vertical) {
    return {
      transform: 'translateY(var(--thumb-active-top))',
      height: 'var(--thumb-active-height)',
    };
  }

  return {
    transform: 'translateX(var(--thumb-active-left))',
    width: 'var(--thumb-active-width)',
  };
};

const onVisibleChanged = () => {
  prevStyle.value = null;
  nextStyle.value = null;
  onMotionEnd();
};
</script>
<template>
  <template v-if="!prevStyle || !nextStyle"></template>
  <template v-else>
    <CSSMotion
      visible
      :motion-name="motionName"
      motion-appear
      @appear-start="onAppearStart"
      @appear-active="onAppearActive"
      @visible-changed="onVisibleChanged"
    >
      <template #default="{ class: motionClassName, style: motionStyle, ref: motionRef }">
        <div
          :style="{
            ...motionStyle,
            '--thumb-start-left': thumbStart,
            '--thumb-start-width': toPX(prevStyle?.width),
            '--thumb-active-left': thumbActive,
            '--thumb-active-width': toPX(nextStyle?.width),
            '--thumb-start-top': thumbStart,
            '--thumb-start-height': toPX(prevStyle?.height),
            '--thumb-active-top': thumbActive,
            '--thumb-active-height': toPX(nextStyle?.height),
          }"
          :class="clsx(`${prefixCls}-thumb`, motionClassName)"
          :ref="composeRef((el) => (thumbRef = el), motionRef)"
        ></div>
      </template>
    </CSSMotion>
  </template>
</template>
