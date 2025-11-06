<script lang="tsx" setup>
import type { ImageProps as RcImageProps } from '@/vc-component/image';
import RcImage from '@/vc-component/image';
import type { VueNode } from '@/vc-util/type';
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, getCurrentInstance, toRefs } from 'vue';
import {
  useMergeSemantic,
  type SemanticClassNames,
  type SemanticClassNamesType,
  type SemanticStyles,
  type SemanticStylesType,
} from '../_util/hooks';
import type { MaskType } from '../_util/hooks/useMergedMask';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useMergedPreviewConfig from './hooks/useMergedPreviewConfig';
import usePreviewConfig from './hooks/usePreviewConfig';
import useStyle from './style';
import { icons } from './util';

type OriginPreviewConfig = NonNullable<Exclude<RcImageProps['preview'], boolean>>;

export type DeprecatedPreviewConfig = {};

export type PreviewConfig = OriginPreviewConfig &
  DeprecatedPreviewConfig & {
    mask?: MaskType | VueNode;
  };

export type ImageSemanticName = 'root' | 'image' | 'cover';

export type PopupSemantic = 'root' | 'mask' | 'body' | 'footer' | 'actions';

export type ImageClassNamesType = SemanticClassNamesType<
  ImageProps,
  ImageSemanticName,
  { popup?: SemanticClassNames<PopupSemantic> }
>;

export type ImageStylesType = SemanticStylesType<ImageProps, ImageSemanticName, { popup?: SemanticStyles<PopupSemantic> }>;

export interface ImageProps extends Omit<RcImageProps, 'preview' | 'classNames' | 'styles'> {
  preview?: boolean | PreviewConfig;
  classNames?: ImageClassNamesType;
  styles?: ImageStylesType;
}

const {
  prefixCls: customizePrefixCls,
  preview = true,
  class: className,
  rootClassName,
  style,
  styles,
  classNames,
  fallback,
  ...otherProps
} = defineProps<ImageProps>();

// =============================== MISC ===============================
// Context
const {
  getPrefixCls,
  getPopupContainer: getContextPopupContainer,
  class: contextClassName,
  style: contextStyle,
  preview: contextPreview,
  styles: contextStyles,
  classNames: contextClassNames,
  fallback: contextFallback,
} = toRefs(useComponentConfig('image'));

const prefixCls = computed(() => getPrefixCls.value('image', customizePrefixCls));

// ============================== Styles ==============================
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const mergedRootClassName = computed(() => clsx(rootClassName, hashId.value, cssVarCls.value, rootCls.value));

const mergedClassName = computed(() => clsx(className, hashId.value, contextClassName?.value));

// ============================= Preview ==============================
const [previewConfig, previewRootClassName, previewMaskClassName] = usePreviewConfig(computed(() => preview));
const [contextPreviewConfig, contextPreviewRootClassName, contextPreviewMaskClassName] = usePreviewConfig(contextPreview);

const mergedPreviewConfig = useMergedPreviewConfig(
  // Preview config
  previewConfig,
  contextPreviewConfig,

  // MISC
  prefixCls,
  mergedRootClassName,
  getContextPopupContainer,
  computed(() => icons),

  computed(() => true),
);

// ============================= Semantic =============================
const mergedLegacyClassNames = computed(() => ({
  cover: clsx(contextPreviewMaskClassName?.value, previewMaskClassName?.value),
  popup: {
    root: clsx(contextPreviewRootClassName?.value, previewRootClassName?.value),
  },
}));

const { mask: mergedMask, blurClassName } = toRefs(reactiveComputed(() => mergedPreviewConfig.value ?? {}));
const mergedPopupClassNames = computed(() => ({
  mask: clsx(!mergedMask?.value && `${prefixCls.value}-preview-mask-hidden`, blurClassName?.value),
}));
const internalClassNames = computed(() => [
  contextClassNames?.value,
  classNames,
  mergedLegacyClassNames?.value,
  { popup: mergedPopupClassNames?.value },
]);

const vm = getCurrentInstance();
const [mergedClassNames, mergedStyles] = useMergeSemantic<ImageClassNamesType, ImageStylesType, ImageProps>(
  internalClassNames,
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      preview: mergedPreviewConfig.value,
    },
  })),
  computed(() => ({
    popup: { _default: 'root' },
  })),
);

const mergedStyle = computed(() => ({ ...contextStyle?.value, ...style }));
const mergedFallback = computed(() => fallback ?? contextFallback?.value);
</script>
<template>
  <RcImage
    :prefix-cls="prefixCls"
    :preview="mergedPreviewConfig || false"
    :root-class-name="mergedRootClassName"
    :class="mergedClassName"
    :style="mergedStyle"
    :fallback="mergedFallback"
    v-bind="otherProps"
    :class-names="mergedClassNames"
    :styles="mergedStyles"
  />
</template>
