<script lang="tsx" setup>
import { Render } from '@/components';
import useMergedState from '@/vc-util/hooks/useMergedState';
import { toPx } from '@/vc-util/setStyle';
import { reactiveComputed, toReactive } from '@vueuse/core';
import clsx from 'clsx';
import { isEmpty, omit } from 'lodash-es';
import { computed, getCurrentInstance, ref, type CSSProperties, type ImgHTMLAttributes } from 'vue';
import { COMMON_PROPS } from './common';
import { usePreviewGroupContextInject } from './context';
import type { TransformType } from './hooks/useImageTransform';
import useRegisterImage from './hooks/useRegisterImage';
import useStatus from './hooks/useStatus';
import type { ImageElementProps } from './interface';
import type { InternalPreviewConfig, PreviewSemanticName, ToolbarRenderInfoType } from './Preview/index.vue';
import Preview from './Preview/index.vue';

export interface ImgInfo {
  url: string;
  alt: string;
  width: string | number;
  height: string | number;
}

export interface CoverConfig {
  coverNode?: any;
  placement?: 'top' | 'bottom' | 'center';
}
export interface PreviewConfig extends Omit<InternalPreviewConfig, 'countRender'> {
  cover?: any | CoverConfig;

  // Similar to InternalPreviewConfig but not have `current`
  imageRender?: (originalNode: any, info: { transform: TransformType; image: ImgInfo }) => any;

  // Similar to InternalPreviewConfig but not have `current` and `total`
  actionsRender?: (originalNode: any, info: Omit<ToolbarRenderInfoType, 'current' | 'total'>) => any;

  onOpenChange?: (open: boolean) => void;
}

export type SemanticName = 'root' | 'image' | 'cover';

export interface ImageProps extends /* @vue-ignore */ Omit<ImgHTMLAttributes, 'placeholder' | 'onClick'> {
  class?: string;
  style?: CSSProperties;
  width?: number | string;
  height?: number | string;
  // Misc
  prefixCls?: string;
  previewPrefixCls?: string;

  // Styles
  rootClassName?: string;
  classNames?: Partial<
    Record<SemanticName, string> & {
      popup?: Partial<Record<PreviewSemanticName, string>>;
    }
  >;
  styles?: Partial<
    Record<SemanticName, CSSProperties> & {
      popup?: Partial<Record<PreviewSemanticName, CSSProperties>>;
    }
  >;

  // Image
  src?: string;
  alt?: string;
  placeholder?: any;
  fallback?: string;

  // Preview
  preview?: boolean | PreviewConfig;

  // Events
  onClick?: (e: MouseEvent) => void;
  onError?: (e) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  // Misc
  prefixCls = 'rc-image',

  // Style
  rootClassName,
  class: className,
  style,

  classNames = {},
  styles = {},

  width,
  height,

  // Image
  src: imgSrc,
  alt,
  placeholder,
  fallback,

  // Preview
  preview = true,

  // Events
  onClick,
  onError,
  ...otherProps
} = defineProps<ImageProps>();

const groupContext = usePreviewGroupContextInject();

// ========================== Preview ===========================
const canPreview = computed(() => !!preview);

const previewConfig = reactiveComputed<PreviewConfig>(() => (preview && typeof preview === 'object' ? preview : {}));

const coverPlacement = computed(() =>
  typeof previewConfig.cover === 'object' && (previewConfig.cover as CoverConfig).placement
    ? (previewConfig.cover as CoverConfig).placement || 'center'
    : 'center',
);

const coverNode = computed(() =>
  typeof previewConfig.cover === 'object' && (previewConfig.cover as CoverConfig).coverNode
    ? (previewConfig.cover as CoverConfig).coverNode
    : (previewConfig.cover as any),
);

// ============================ Open ============================
const [isShowPreview, setShowPreview] = useMergedState(!!previewConfig.open, {
  value: computed(() => previewConfig.open),
});

const mousePosition = ref<null | { x: number; y: number }>(null);

const triggerPreviewOpen = (nextOpen: boolean) => {
  setShowPreview(nextOpen);
  previewConfig.onOpenChange?.(nextOpen);
};

const onPreviewClose = () => {
  triggerPreviewOpen(false);
};

// ========================= ImageProps =========================
const isCustomPlaceholder = computed(() => placeholder && placeholder !== true);

const src = computed(() => previewConfig.src ?? imgSrc);
const [getImgRef, srcAndOnload, status] = useStatus(
  reactiveComputed(() => ({
    src: imgSrc,
    isCustomPlaceholder: isCustomPlaceholder.value,
    fallback,
  })),
);
const vm = getCurrentInstance();
const imgCommonProps = computed(() => {
  const obj: ImageElementProps = {};
  COMMON_PROPS.forEach((prop: any) => {
    if (vm.props[prop] !== undefined) {
      obj[prop] = vm.props[prop];
    }
  });

  return obj;
});

// ========================== Register ==========================
const registerData = computed<ImageElementProps>(() => ({
  ...imgCommonProps.value,
  src: src.value,
}));

const imageId = useRegisterImage(canPreview, toReactive(registerData));

// ========================== Preview ===========================
const onPreview = (e) => {
  const rect = (e.target as HTMLDivElement).getBoundingClientRect();
  const left = rect.x + rect.width / 2;
  const top = rect.y + rect.height / 2;

  if (!isEmpty(groupContext)) {
    groupContext.onPreview(imageId.value, src.value, left, top);
  } else {
    mousePosition.value = {
      x: left,
      y: top,
    };
    triggerPreviewOpen(true);
  }

  onClick?.(e);
};
</script>
<template>
  <div
    v-bind="otherProps"
    :class="
      clsx(prefixCls, rootClassName, classNames.root, {
        [`${prefixCls}-error`]: status === 'error',
      })
    "
    @click="(e) => (canPreview ? onPreview?.(e) : onClick?.(e))"
    :style="{ width: toPx(width), height: toPx(height), ...styles.root }"
  >
    <img
      v-bind="{ ...imgCommonProps, ...srcAndOnload }"
      :class="
        clsx(
          `${prefixCls}-img`,
          {
            [`${prefixCls}-img-placeholder`]: placeholder === true,
          },
          classNames.image,
          className,
        )
      "
      :style="{
        height: toPx(height),
        ...styles.image,
        ...style,
      }"
      :ref="getImgRef"
      :width="width"
      :height="height"
      @error="onError"
    />
    <div v-if="status === 'loading'" aria-hidden="true" :class="`${prefixCls}-placeholder`">
      <Render :content="placeholder" />
    </div>
    <div
      v-if="previewConfig.cover !== false && canPreview"
      :class="clsx(`${prefixCls}-cover`, classNames.cover, `${prefixCls}-cover-${coverPlacement}`)"
      :style="{ display: style?.display === 'none' ? 'none' : undefined, ...styles.cover }"
    >
      <Render :content="coverNode" />
    </div>
  </div>
  <Preview
    v-if="previewConfig.cover !== false && canPreview"
    :aria-hidden="!isShowPreview"
    :open="isShowPreview"
    :prefix-cls="previewPrefixCls || `${prefixCls}-preview`"
    @close="onPreviewClose"
    :mouse-position="mousePosition"
    :src="src"
    :alt="alt"
    :image-info="{ width, height }"
    :fallback="fallback"
    :img-common-props="imgCommonProps"
    v-bind="omit(previewConfig, ['src', 'open', 'onOpenChange', 'cover', 'rootClassName'])"
  />
</template>
