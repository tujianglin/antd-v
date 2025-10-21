<script lang="tsx" setup>
import CSSMotion, { type CSSMotionProps } from '@/vc-component/motion';
import Render from '@/vc-component/render';
import ResizeObserver, { type ResizeObserverProps } from '@/vc-component/resize-observer';
import { activePopups, composeRef, registerPopup } from '@/vc-util/ref';
import clsx from 'clsx';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from 'vue';
import useOffsetStyle from '../hooks/useOffsetStyle';
import type { AlignType, TriggerProps } from '../index.vue';
import type { ArrowPos, ArrowTypeOuter } from '../interface';
import Arrow from './Arrow.vue';
import Mask from './Mask.vue';
import PopupContent from './PopupContent.vue';

export interface MobileConfig {
  mask?: boolean;
  /** Set popup motion. You can ref `rc-motion` for more info. */
  motion?: CSSMotionProps;
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps;
}

export interface PopupProps {
  prefixCls: string;
  class?: string;
  style?: CSSProperties;
  popup?: TriggerProps['popup'];
  target: HTMLElement;
  onMouseenter?: (e: MouseEvent) => void;
  onMouseleave?: (e: MouseEvent) => void;
  onPointerEnter?: (e: MouseEvent) => void;
  onPointerDownCapture?: (e: MouseEvent) => void;
  zIndex?: number;

  mask?: boolean;
  onVisibleChanged: (visible: boolean) => void;

  // Arrow
  align?: AlignType;
  arrow?: ArrowTypeOuter;
  arrowPos: ArrowPos;

  // Open
  open: boolean;
  /** Tell Portal that should keep in screen. e.g. should wait all motion end */
  keepDom: boolean;
  fresh?: boolean;

  // Click
  onClick?: (e: MouseEvent) => void;

  // Motion
  motion?: CSSMotionProps;
  maskMotion?: CSSMotionProps;

  // Portal
  forceRender?: boolean;
  getPopupContainer?: TriggerProps['getPopupContainer'];
  autoDestroy?: boolean;
  portal: any;

  // Align
  ready: boolean;
  offsetX: number;
  offsetY: number;
  offsetR: number;
  offsetB: number;
  onAlign: VoidFunction;
  onPrepare: () => Promise<void>;

  // stretch
  stretch?: string;
  targetWidth?: number;
  targetHeight?: number;

  // Resize
  onResize?: ResizeObserverProps['onResize'];

  // Mobile
  mobile?: MobileConfig;
}

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
  portal: Portal,

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

  // Resize
  onResize,

  stretch,
  targetWidth,
  targetHeight,
} = defineProps<PopupProps>();

// We can not remove holder only when motion finished.
const isNodeVisible = computed(() => open || keepDom);

const isMobile = computed(() => !!mobile);

// ========================== Mask ==========================
const mergedMask = computed(() => (mobile ? mobile.mask : mask));
const mergedMaskMotion = computed(() => (mobile ? mobile.maskMotion : maskMotion));
const mergedPopupMotion = computed(() => (mobile ? mobile.motion : motion));

// ======================= Container ========================
const getPopupContainerNeedParams = computed(() => getPopupContainer?.length > 0);

const show = ref(!getPopupContainer || !getPopupContainerNeedParams.value);

// Delay to show since `getPopupContainer` need target element
watch(
  [show, getPopupContainerNeedParams, () => target],
  async () => {
    await nextTick();
    if (!show.value && getPopupContainerNeedParams.value && target) {
      show.value = true;
    }
  },
  { flush: 'post', immediate: true, deep: true },
);

// ========================= Resize =========================
const onInternalResize: ResizeObserverProps['onResize'] = (size, ele) => {
  onResize?.(size, ele);
  onAlign();
};

// ========================= Styles =========================
const offsetStyle = useOffsetStyle(
  isMobile,
  computed(() => ready),
  computed(() => open),
  computed(() => align),
  computed(() => offsetR),
  computed(() => offsetB),
  computed(() => offsetX),
  computed(() => offsetY),
);

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

onMounted(() => {
  const unregister = registerPopup(domRef.value!, onMouseleave);
  onBeforeUnmount(() => {
    unregister();
  });
});

function onMouseout(e: MouseEvent) {
  const related = e.relatedTarget as Node | null;
  const stillInside = [...activePopups.keys()].some((popup) => popup?.contains(related));
  if (!stillInside) {
    for (const onMouseleave of activePopups.values()) {
      onMouseleave?.(e);
    }
  }
}
</script>
<template>
  <component
    v-if="show"
    :is="Portal"
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
    <ResizeObserver @resize="onInternalResize" :disabled="!open">
      <CSSMotion
        motion-appear
        motion-enter
        motion-leave
        :remove-on-leave="false"
        :force-render="forceRender"
        :leaved-class-name="`${prefixCls}-hidden`"
        v-bind="mergedPopupMotion"
        @appear-prepare="onPrepare"
        @enter-prepare="onPrepare"
        :visible="open"
        @visible-changed="
          (nextVisible) => {
            motion?.onVisibleChanged?.(nextVisible);
            onVisibleChanged(nextVisible);
          }
        "
      >
        <template #default="{ class: motionClassName, style: motionStyle, ref: motionRef }">
          <div
            :ref="composeRef((el) => (domRef = el), motionRef)"
            :class="
              clsx(prefixCls, motionClassName, className, {
                [`${prefixCls}-mobile`]: isMobile,
              })
            "
            :style="{
              '--arrow-x': `${arrowPos.x || 0}px`,
              '--arrow-y': `${arrowPos.y || 0}px`,
              ...offsetStyle,
              ...miscStyle,
              ...motionStyle,
              boxSizing: 'border-box',
              ...style,
              zIndex,
            }"
            @mouseenter="onMouseenter"
            @mouseout="onMouseout"
            @pointerenter="onPointerEnter"
            @click="onClick"
            @pointerdown.capture="onPointerDownCapture"
          >
            <Arrow v-if="arrow" :prefix-cls="prefixCls" :arrow="arrow" :arrow-pos="arrowPos" :align="align" />
            <PopupContent :cache="!open && !fresh">
              <Render :content="popup" />
            </PopupContent>
          </div>
        </template>
      </CSSMotion>
    </ResizeObserver>
    <slot></slot>
  </component>
</template>
