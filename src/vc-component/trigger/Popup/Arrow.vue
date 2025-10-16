<script lang="tsx" setup>
import Render from '@/vc-component/render';
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties } from 'vue';
import type { AlignType, ArrowPos, ArrowTypeOuter } from '../interface';
export interface ArrowProps {
  prefixCls: string;
  align: AlignType;
  arrow: ArrowTypeOuter;
  arrowPos: ArrowPos;
}

const { prefixCls, align, arrow, arrowPos } = defineProps<ArrowProps>();

const { class: className, content, style } = toRefs(reactiveComputed(() => arrow || {}));
const { x, y } = toRefs(reactiveComputed(() => arrowPos));

const alignStyle = computed(() => {
  const result: CSSProperties = {
    position: 'absolute',
  };

  // Skip if no need to align
  if (align.autoArrow !== false) {
    const popupPoints = align.points[0];
    const targetPoints = align.points[1];
    const popupTB = popupPoints[0];
    const popupLR = popupPoints[1];
    const targetTB = targetPoints[0];
    const targetLR = targetPoints[1];

    // Top & Bottom
    if (popupTB === targetTB || !['t', 'b'].includes(popupTB)) {
      result.top = `${y.value || 0}px`;
    } else if (popupTB === 't') {
      result.top = 0;
    } else {
      result.bottom = 0;
    }

    // Left & Right
    if (popupLR === targetLR || !['l', 'r'].includes(popupLR)) {
      result.left = `${x.value || 0}px`;
    } else if (popupLR === 'l') {
      result.left = 0;
    } else {
      result.right = 0;
    }
  }
  return result;
});
</script>
<template>
  <template v-if="!align || !align.points"></template>
  <div v-else :class="clsx(`${prefixCls}-arrow`, className)" :style="{ ...alignStyle, ...style }">
    <Render :content="content" />
  </div>
</template>
