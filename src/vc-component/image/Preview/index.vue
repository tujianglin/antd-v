<script lang="tsx" setup>
import type { PortalProps } from '@/vc-component/portal/index.vue';
import { reactiveComputed } from '@vueuse/core';
import { isEmpty } from 'lodash-es';
import { computed, nextTick, onBeforeUnmount, ref, toRefs, watch, type CSSProperties, type ImgHTMLAttributes } from 'vue';
import { usePreviewGroupContextInject } from '../context';
import type { TransformAction, TransformType } from '../hooks/useImageTransform';
import useImageTransform from '../hooks/useImageTransform';
import useMouseEvent from '../hooks/useMouseEvent';
import useTouchEvent from '../hooks/useTouchEvent';
import type { ImgInfo } from '../Image.vue';
import { BASE_SCALE_RATIO } from '../previewConfig';
import type { FooterSemanticName } from './Footer.vue';
import PreviewImage from './PreviewImage.vue';
import KeyCode from '@/vc-util/KeyCode';
import Portal from '@/vc-component/portal';
import CSSMotion from '@/vc-component/motion';
import clsx from 'clsx';
import Render from '@/vc-component/render';
import CloseBtn from './CloseBtn.vue';
import PrevNext from './PrevNext.vue';
import Footer from './Footer.vue';
// Note: if you want to add `action`,
// pls contact @zombieJ or @thinkasany first.
export type PreviewSemanticName = 'root' | 'mask' | 'body' | FooterSemanticName;

export interface OperationIcons {
  rotateLeft?: any;
  rotateRight?: any;
  zoomIn?: any;
  zoomOut?: any;
  close?: any;
  prev?: any;
  next?: any;
  flipX?: any;
  flipY?: any;
}

export interface Actions {
  onActive: (offset: number) => void;
  onFlipY: () => void;
  onFlipX: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onClose: () => void;
  onReset: () => void;
}

export type ToolbarRenderInfoType = {
  icons: {
    prevIcon?: any;
    nextIcon?: any;
    flipYIcon: any;
    flipXIcon: any;
    rotateLeftIcon: any;
    rotateRightIcon: any;
    zoomOutIcon: any;
    zoomInIcon: any;
  };
  actions: Actions;
  transform: TransformType;
  current: number;
  total: number;
  image: ImgInfo;
};

export interface InternalPreviewConfig {
  // Semantic
  /** Better to use `classNames.root` instead */
  rootClassName?: string;

  // Image
  src?: string;
  alt?: string;

  // Scale
  scaleStep?: number;
  minScale?: number;
  maxScale?: number;

  // Display
  motionName?: string;
  open?: boolean;
  getContainer?: PortalProps['getContainer'];
  zIndex?: number;
  afterOpenChange?: (open: boolean) => void;

  // Operation
  movable?: boolean;
  icons?: OperationIcons;
  closeIcon?: any;

  onTransform?: (info: { transform: TransformType; action: TransformAction }) => void;

  // Render
  countRender?: (current: number, total: number) => any;
  imageRender?: (originalNode: any, info: { transform: TransformType; current?: number; image: ImgInfo }) => any;
  actionsRender?: (originalNode: any, info: ToolbarRenderInfoType) => any;
}

export interface PreviewProps extends InternalPreviewConfig {
  // Misc
  prefixCls: string;

  classNames?: Partial<Record<PreviewSemanticName, string>>;
  styles?: Partial<Record<PreviewSemanticName, CSSProperties>>;

  // Origin image Info
  imageInfo?: {
    width: number | string;
    height: number | string;
  };
  fallback?: string;

  // Preview image
  imgCommonProps?: ImgHTMLAttributes;
  width?: string | number;
  height?: string | number;

  // Pagination
  current?: number;
  count?: number;
  onChange?: (current: number, prev: number) => void;

  // Events
  onClose?: () => void;

  // Display
  mousePosition: null | { x: number; y: number };
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  rootClassName,
  src,
  alt,
  imageInfo,
  fallback,
  movable = true,
  onClose,
  open,
  afterOpenChange,
  icons = {},
  closeIcon,
  getContainer,
  current = 0,
  count = 1,
  countRender,
  scaleStep = 0.5,
  minScale = 1,
  maxScale = 50,
  motionName = 'fade',
  imageRender,
  imgCommonProps,
  actionsRender,
  onTransform,
  onChange,
  classNames = {},
  styles = {},
  mousePosition,
  zIndex,
  width,
  height,
} = defineProps<PreviewProps>();

const imgRef = ref<HTMLImageElement>(null);
const groupContext = usePreviewGroupContextInject();
const showLeftOrRightSwitches = computed(() => !isEmpty(groupContext) && count > 1);
const showOperationsProgress = computed(() => !isEmpty(groupContext) && count >= 1);

// ======================== Transform =========================
const enableTransition = ref(true);
const { transform, resetTransform, updateTransform, dispatchZoomChange } = useImageTransform(
  imgRef,
  computed(() => minScale),
  computed(() => maxScale),
  onTransform,
);

const { isMoving, onMouseDown, onWheel } = useMouseEvent(
  imgRef,
  computed(() => movable),
  computed(() => open),
  computed(() => scaleStep),
  transform,
  updateTransform,
  dispatchZoomChange,
);
const { isTouching, onTouchStart, onTouchMove, onTouchEnd } = useTouchEvent(
  imgRef,
  computed(() => movable),
  computed(() => open),
  computed(() => minScale),
  transform,
  updateTransform,
  dispatchZoomChange,
);
const { rotate, scale } = toRefs(reactiveComputed(() => transform.value));

watch(
  enableTransition,
  () => {
    if (!enableTransition.value) {
      enableTransition.value = true;
    }
  },
  { immediate: true },
);

watch(
  () => open,
  () => {
    if (!open) {
      resetTransform('close');
    }
  },
  { immediate: true },
);

// ========================== Image ===========================
const onDoubleClick = (event: MouseEvent) => {
  if (open) {
    if (scale.value !== 1) {
      updateTransform({ x: 0, y: 0, scale: 1 }, 'doubleClick');
    } else {
      dispatchZoomChange(BASE_SCALE_RATIO + scaleStep, 'doubleClick', event.clientX, event.clientY);
    }
  }
};

const imgNode = () => {
  return (
    <PreviewImage
      {...imgCommonProps}
      width={width}
      height={height}
      ref={imgRef}
      class={`${prefixCls}-img`}
      alt={alt}
      style={{
        transform: `translate3d(${transform.value.x}px, ${transform.value.y}px, 0) scale3d(${
          transform.value.flipX ? '-' : ''
        }${scale.value}, ${transform.value.flipY ? '-' : ''}${scale.value}, 1) rotate(${rotate.value}deg)`,
        transitionDuration: (!enableTransition.value || isTouching.value) && '0s',
      }}
      fallback={fallback}
      src={src}
      onWheel={onWheel}
      onMousedown={onMouseDown}
      onDblclick={onDoubleClick}
      onTouchstart={onTouchStart}
      onTouchmove={onTouchMove}
      onTouchend={onTouchEnd}
      onTouchcancel={onTouchEnd}
    />
  );
};

const image = computed(() => ({
  url: src,
  alt,
  ...imageInfo,
}));

// ======================== Operation =========================
// >>>>> Actions
const onZoomIn = () => {
  dispatchZoomChange(BASE_SCALE_RATIO + scaleStep, 'zoomIn');
};

const onZoomOut = () => {
  dispatchZoomChange(BASE_SCALE_RATIO / (BASE_SCALE_RATIO + scaleStep), 'zoomOut');
};

const onRotateRight = () => {
  updateTransform({ rotate: rotate.value + 90 }, 'rotateRight');
};

const onRotateLeft = () => {
  updateTransform({ rotate: rotate.value - 90 }, 'rotateLeft');
};

const onFlipX = () => {
  updateTransform({ flipX: !transform.value.flipX }, 'flipX');
};

const onFlipY = () => {
  updateTransform({ flipY: !transform.value.flipY }, 'flipY');
};

const onReset = () => {
  resetTransform('reset');
};

const onActive = (offset: number) => {
  const nextCurrent = current + offset;

  if (nextCurrent >= 0 && nextCurrent <= count - 1) {
    enableTransition.value = false;
    resetTransform(offset < 0 ? 'prev' : 'next');
    onChange?.(nextCurrent, current);
  }
};

// >>>>> Effect: Keyboard
const onKeyDown = (event: KeyboardEvent) => {
  if (open) {
    const { keyCode } = event;

    if (keyCode === KeyCode.ESC) {
      onClose?.();
    }

    if (showLeftOrRightSwitches.value) {
      if (keyCode === KeyCode.LEFT) {
        onActive(-1);
      } else if (keyCode === KeyCode.RIGHT) {
        onActive(1);
      }
    }
  }
};

watch(
  () => open,
  () => {
    if (open) {
      window.addEventListener('keydown', onKeyDown);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown);
});

// ======================= Lock Scroll ========================
const lockScroll = ref(false);

watch(
  () => open,
  () => {
    if (open) {
      lockScroll.value = true;
    }
  },
  { immediate: true },
);

const onVisibleChanged = (nextVisible: boolean) => {
  if (!nextVisible) {
    lockScroll.value = false;
  }
  afterOpenChange?.(nextVisible);
};

// ========================== Portal ==========================
const portalRender = ref(false);
watch(
  () => open,
  () => {
    nextTick(() => {
      if (open) {
        portalRender.value = true;
      }
    });
  },
  { immediate: true, flush: 'post' },
);

// ========================== Render ==========================
const bodyStyle = computed(() => {
  const result: CSSProperties = {
    ...styles.body,
  };
  if (mousePosition) {
    result.transformOrigin = `${mousePosition.x}px ${mousePosition.y}px`;
  }
  return result;
});
</script>
<template>
  <Portal :open="portalRender" :get-container="getContainer" :auto-lock="lockScroll">
    <CSSMotion
      :motion-name="motionName"
      :visible="portalRender && open"
      motion-appear
      motion-enter
      motion-leave
      @visible-changed="onVisibleChanged"
    >
      <template #default="{ class: motionClassName, style: motionStyle, ref: motionRef }">
        <div
          :ref="motionRef"
          :class="
            clsx(prefixCls, rootClassName, classNames.root, motionClassName, {
              [`${prefixCls}-moving`]: isMoving,
            })
          "
          :style="
            (() => {
              const mergedStyle = {
                ...styles.root,
                ...motionStyle,
              };

              if (zIndex) {
                mergedStyle.zIndex = zIndex;
              }
              return mergedStyle;
            })()
          "
        >
          <div :class="clsx(`${prefixCls}-mask`, classNames.mask)" :style="styles.mask" @click="onClose"></div>
          <div :class="clsx(`${prefixCls}-body`, classNames.body)" :style="bodyStyle">
            <Render
              :content="
                imageRender ? imageRender(imgNode(), { transform, image, ...(groupContext ? { current } : {}) }) : imgNode
              "
            />
          </div>
          <CloseBtn
            v-if="closeIcon !== false && closeIcon !== null"
            :prefix-cls="prefixCls"
            :icon="closeIcon === true ? icons.close : closeIcon || icons.close"
            @click="onClose"
          />
          <PrevNext
            v-if="showLeftOrRightSwitches"
            :prefix-cls="prefixCls"
            :current="current"
            :count="count"
            :icons="icons"
            @active="onActive"
          />
          <Footer
            :prefix-cls="prefixCls"
            :show-progress="showOperationsProgress"
            :current="current"
            :count="count"
            :show-switch="showLeftOrRightSwitches"
            :class-names="classNames"
            :styles="styles"
            :image="image"
            :transform="transform"
            :icons="icons"
            :count-render="countRender"
            :actions-render="actionsRender"
            :scale="scale"
            :min-scale="minScale"
            :max-scale="maxScale"
            @active="onActive"
            @flip-y="onFlipY"
            @flip-x="onFlipX"
            @rotate-left="onRotateLeft"
            @rotate-right="onRotateRight"
            @zoom-out="onZoomOut"
            @zoom-in="onZoomIn"
            @close="onClose"
            @reset="onReset"
          />
        </div>
      </template>
    </CSSMotion>
  </Portal>
</template>
