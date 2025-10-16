<script lang="tsx" setup>
import useControlledState from '@/vc-util/hooks/useControlledState';
import { reactiveComputed } from '@vueuse/core';
import { omit } from 'lodash-es';
import { computed, ref, watch, type CSSProperties } from 'vue';
import { PreviewGroupContextProvider } from './context';
import type { TransformType } from './hooks/useImageTransform';
import usePreviewItems from './hooks/usePreviewItems';
import type { ImgInfo } from './Image.vue';
import type { ImageElementProps } from './interface';
import type { InternalPreviewConfig, PreviewProps, PreviewSemanticName } from './Preview/index.vue';
import Preview from './Preview/index.vue';

export interface GroupPreviewConfig extends InternalPreviewConfig {
  current?: number;
  // Similar to InternalPreviewConfig but has additional current
  imageRender?: (originalNode: any, info: { transform: TransformType; current?: number; image: ImgInfo }) => any;
  onOpenChange?: (value: boolean, info: { current: number }) => void;
  onChange?: (current: number, prevCurrent: number) => void;
}

export interface PreviewGroupProps {
  previewPrefixCls?: string;
  classNames?: {
    popup?: Partial<Record<PreviewSemanticName, string>>;
  };

  styles?: {
    popup?: Partial<Record<PreviewSemanticName, CSSProperties>>;
  };

  icons?: PreviewProps['icons'];
  items?: (string | ImageElementProps)[];
  fallback?: string;
  preview?: boolean | GroupPreviewConfig;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  previewPrefixCls = 'rc-image-preview',
  classNames,
  styles,
  icons = {},
  items,
  preview,
  fallback,
} = defineProps<PreviewGroupProps>();

const previewConfig = reactiveComputed<GroupPreviewConfig>(() => (preview && typeof preview === 'object' ? preview : {}));

// ========================== Items ===========================
const [mergedItems, register, fromItems] = usePreviewItems(computed(() => items));

// ========================= Preview ==========================
// >>> Index
const [current, setCurrent] = useControlledState(
  0,
  computed(() => previewConfig.current),
);

const keepOpenIndex = ref(false);

// >>> Image
const imageProps = reactiveComputed(() => mergedItems.value[current.value]?.data || {});
// >>> Visible
const [isShowPreview, setShowPreview] = useControlledState(
  !!previewConfig.open,
  computed(() => previewConfig.open),
);

const triggerShowPreview = (next: boolean) => {
  setShowPreview(next);
  if (next !== isShowPreview.value) {
    previewConfig?.onOpenChange?.(next, { current: current.value });
  }
};

// >>> Position
const mousePosition = ref<null | { x: number; y: number }>(null);

const onPreviewFromImage = (id, imageSrc, mouseX, mouseY) => {
  const index = fromItems.value
    ? mergedItems.value.findIndex((item) => item.data.src === imageSrc)
    : mergedItems.value.findIndex((item) => item.id === id);

  setCurrent(index < 0 ? 0 : index);
  triggerShowPreview(true);
  mousePosition.value = { x: mouseX, y: mouseY };

  keepOpenIndex.value = true;
};

// Reset current when reopen
watch(
  isShowPreview,
  () => {
    if (isShowPreview.value) {
      if (!keepOpenIndex.value) {
        setCurrent(0);
      }
    } else {
      keepOpenIndex.value = false;
    }
  },
  { immediate: true },
);

// ========================== Events ==========================
const onInternalChange: GroupPreviewConfig['onChange'] = (next, prev) => {
  setCurrent(next);

  previewConfig.onChange?.(next, prev);
};

const onPreviewClose = () => {
  setShowPreview(false);
  mousePosition.value = null;
};

// ========================= Context ==========================
const previewGroupContext = reactiveComputed(() => ({ register, onPreview: onPreviewFromImage }));
</script>
<template>
  <PreviewGroupContextProvider :value="previewGroupContext">
    <slot></slot>
    <Preview
      :aria-hidden="!isShowPreview"
      :open="isShowPreview"
      :prefix-cls="previewPrefixCls"
      @close="onPreviewClose"
      :mouse-position="mousePosition"
      :img-common-props="omit(imageProps, ['src'])"
      :src="imageProps.src"
      :fallback="fallback"
      :icons="icons"
      :current="current"
      :count="mergedItems.length"
      @change="onInternalChange"
      v-bind="omit(previewConfig, ['open', 'onOpenChange', 'current', 'onChange'])"
      :class-names="classNames?.popup"
      :styles="styles?.popup"
    />
  </PreviewGroupContextProvider>
</template>
