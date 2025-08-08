<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { assign } from 'lodash-es';
import { computed, ref, toRefs, type CSSProperties, type TransitionProps } from 'vue';
import { Render } from '../../../components';
import Portal from '../../portal';
import ResizeObserver from '../../resize-observer';
import Arrow from './Arrow.vue';
import type { PopupProps } from './interface';
import Mask from './Mask.vue';
import PopupContent from './PopupContent.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  popup,
  class: className,
  prefixCls,
  style,
  target,

  onVisibleChanged,

  // Open
  open,
  keepDom,
  fresh,

  // Click
  onClick,

  // Mask
  mask,

  // Arrow
  arrow,
  arrowPos,
  align,

  // Motion
  motion,
  maskMotion,

  // Mobile
  mobile,

  // Portal
  forceRender,
  getPopupContainer,
  autoDestroy,

  zIndex,

  onMouseenter,
  onMouseleave,
  onPointerEnter,
  onPointerDownCapture,

  ready,
  offsetX,
  offsetY,
  offsetR,
  offsetB,
  onAlign,
  onPrepare,

  stretch,
  targetWidth,
  targetHeight,
} = defineProps<PopupProps>();

// We can not remove holder only when motion finished.
const isNodeVisible = computed(() => open || keepDom);

const isMobile = computed(() => !!mobile);

// ========================== Mask ==========================
const { mergedMask, mergedMaskMotion, mergedPopupMotion } = toRefs(
  reactiveComputed(
    (): {
      mergedMask: boolean;
      mergedMaskMotion: TransitionProps | undefined;
      mergedPopupMotion: TransitionProps | undefined;
    } => {
      if (mobile) {
        return { mergedMask: mobile.mask, mergedMaskMotion: mobile.maskMotion, mergedPopupMotion: mobile.motion };
      }
      return { mergedMask: mask, mergedMaskMotion: maskMotion, mergedPopupMotion: motion };
    },
  ),
);

// >>>>> Offset
const AUTO = 'auto' as const;

const offsetStyle = computed(() => {
  const result: CSSProperties = isMobile.value
    ? {}
    : {
        left: '-1000vw',
        top: '-1000vh',
        right: AUTO,
        bottom: AUTO,
      };

  // Set align style
  if (!isMobile.value && (ready || open)) {
    const { points } = align;
    const dynamicInset = align.dynamicInset || (align as any)._experimental?.dynamicInset;
    const alignRight = dynamicInset && points[0][1] === 'r';
    const alignBottom = dynamicInset && points[0][0] === 'b';

    if (alignRight) {
      result.right = `${offsetR}px`;
      result.left = AUTO;
    } else {
      result.left = `${offsetX}px`;
      result.right = AUTO;
    }

    if (alignBottom) {
      result.bottom = `${offsetB}px`;
      result.top = AUTO;
    } else {
      result.top = `${offsetY}px`;
      result.bottom = AUTO;
    }
  }
  return result;
});

// >>>>> Misc
const miscStyle = computed(() => {
  const result: CSSProperties = {};
  if (stretch) {
    if (stretch.includes('height') && targetHeight) {
      result.height = `${targetHeight}px`;
    } else if (stretch.includes('minHeight') && targetHeight) {
      result.minHeight = `${targetHeight}px`;
    }
    if (stretch.includes('width') && targetWidth) {
      result.width = `${targetWidth}px`;
    } else if (stretch.includes('minWidth') && targetWidth) {
      result.minWidth = `${targetWidth}px`;
    }
  }

  if (!open) {
    result.pointerEvents = 'none';
  }
  return result;
});

const domRef = ref();
defineExpose({
  get el() {
    return domRef.value;
  },
});
</script>
<template>
  <Portal
    :open="forceRender || isNodeVisible"
    :get-container="getPopupContainer && (() => getPopupContainer(target))"
    :auto-destroy="autoDestroy"
  >
    <Mask
      :prefix-cls="prefixCls"
      :open="open"
      :z-index="zIndex"
      :mask="mergedMask"
      :motion="mergedMaskMotion"
      :mobile="isMobile"
    />
    <ResizeObserver @resize="onAlign" :disabled="!open">
      <Transition
        appear
        v-bind="mergedPopupMotion"
        @before-enter="onPrepare"
        @before-appear="onPrepare"
        @after-enter="() => onVisibleChanged(true)"
        @after-leave="() => onVisibleChanged(false)"
      >
        <div
          ref="domRef"
          :class="
            clsx(prefixCls, className, {
              [`${prefixCls}-mobile`]: isMobile,
              [`${prefixCls}-hidden`]: !forceRender && !isNodeVisible,
            })
          "
          :style="
          assign(
            {
              '--arrow-x': `${arrowPos.x || 0}px`,
              '--arrow-y': `${arrowPos.y || 0}px`,
              ...offsetStyle,
              ...miscStyle,
              ...style,
              boxSizing: 'border-box',
              zIndex,
            },
            forceRender && !open ? { display: 'none' } : {},
          ) as CSSProperties
        "
          @mouseenter="onMouseenter"
          @mouseleave="onMouseleave"
          @pointerenter="onPointerEnter"
          @click="onClick"
          @pointerdown.capture="onPointerDownCapture"
        >
          <Arrow v-if="arrow" :prefix-cls="prefixCls" :arrow="arrow" :arrow-pos="arrowPos" :align="align" />
          <PopupContent :cache="!open && !fresh">
            <Render :content="popup" />
          </PopupContent>
        </div>
      </Transition>
    </ResizeObserver>
  </Portal>
</template>
<style lang="less"></style>
