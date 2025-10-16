<script lang="tsx" setup>
import type { CSSMotionProps } from '@/vc-component/motion';
import CSSMotion from '@/vc-component/motion';
import clsx from 'clsx';
import { computed, ref, shallowRef, watchEffect, type CSSProperties } from 'vue';
import useOffsetStyle from '../hooks/useOffsetStyle';
import type { AlignType, ArrowPos } from '../interface';

export interface UniqueContainerProps {
  prefixCls: string; // ${prefixCls}-unique-container
  isMobile: boolean;
  ready: boolean;
  open: boolean;
  align: AlignType;
  offsetR: number;
  offsetB: number;
  offsetX: number;
  offsetY: number;
  arrowPos?: ArrowPos;
  popupSize?: { width: number; height: number };
  motion?: CSSMotionProps;
  uniqueContainerClassName?: string;
  uniqueContainerStyle?: CSSProperties;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  isMobile,
  ready,
  open,
  align,
  offsetR,
  offsetB,
  offsetX,
  offsetY,
  arrowPos,
  popupSize,
  motion,
  uniqueContainerClassName,
  uniqueContainerStyle,
} = defineProps<UniqueContainerProps>();

const containerCls = computed(() => `${prefixCls}-unique-container`);

const motionVisible = ref(false);

// ========================= Styles =========================
const offsetStyle = useOffsetStyle(
  computed(() => isMobile),
  computed(() => ready),
  computed(() => open),
  computed(() => align),
  computed(() => offsetR),
  computed(() => offsetB),
  computed(() => offsetX),
  computed(() => offsetY),
);

// Cache for offsetStyle when ready is true
const cachedOffsetStyleRef = shallowRef(offsetStyle.value);

// Update cached offset style when ready is true
watchEffect(() => {
  if (ready) {
    cachedOffsetStyleRef.value = offsetStyle.value;
  }
});

// Apply popup size if available
const sizeStyle = computed(() => {
  const result = {} as CSSProperties;
  if (popupSize) {
    result.width = `${popupSize.width}px`;
    result.height = `${popupSize.height}px`;
  }
  return result;
});
</script>
<template>
  <CSSMotion
    motion-appear
    motion-enter
    motion-leave
    :remove-on-leave="false"
    :leaved-class-name="`${containerCls}-hidden`"
    v-bind="motion"
    :visible="open"
    @visible-changed="
      (nextVisible) => {
        motionVisible = nextVisible;
      }
    "
  >
    <template #default="{ class: motionClassName, style: motionStyle, ref: motionRef }">
      <div
        :ref="motionRef"
        :class="clsx(containerCls, motionClassName, uniqueContainerClassName, { [`${containerCls}-visible`]: motionVisible })"
        :style="{
          '--arrow-x': `${arrowPos?.x || 0}px`,
          '--arrow-y': `${arrowPos?.y || 0}px`,
          ...cachedOffsetStyleRef,
          ...sizeStyle,
          ...motionStyle,
          ...uniqueContainerStyle,
        }"
      ></div>
    </template>
  </CSSMotion>
</template>
