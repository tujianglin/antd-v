<script lang="tsx" setup>
import RcImage from '@/vc-component/image';
import type { PreviewGroupProps as RcPreviewGroupProps } from '@/vc-component/image/PreviewGroup.vue';
import type { DeprecatedPreviewConfig, ImageClassNamesType, ImageStylesType } from './index.vue';
import type { MaskType } from '../_util/hooks/useMergedMask';
import { useMergeSemantic } from '../_util/hooks';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useMergedPreviewConfig from './hooks/useMergedPreviewConfig';
import usePreviewConfig from './hooks/usePreviewConfig';
import useStyle from './style';
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { computed, toRefs } from 'vue';
import clsx from 'clsx';
import { icons } from './util';
import { reactiveComputed } from '@vueuse/core';

type OriginPreviewConfig = NonNullable<Exclude<RcPreviewGroupProps['preview'], boolean>>;

export type GroupPreviewConfig = OriginPreviewConfig &
  DeprecatedPreviewConfig & {
    mask?: MaskType;
  };

export interface PreviewGroupProps extends Omit<RcPreviewGroupProps, 'preview'> {
  preview?: boolean | GroupPreviewConfig;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { previewPrefixCls: customizePrefixCls, preview, classNames, styles, ...otherProps } = defineProps<PreviewGroupProps>();

// =============================== MISC ===============================
// Context
const {
  getPrefixCls,
  getPopupContainer: getContextPopupContainer,
  direction,
  preview: contextPreview,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('image'));

const prefixCls = computed(() => getPrefixCls.value('image', customizePrefixCls));
const previewPrefixCls = computed(() => `${prefixCls.value}-preview`);

// ============================== Style ===============================
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const mergedRootClassName = computed(() => clsx(hashId.value, cssVarCls.value, rootCls.value));

// ============================= Preview ==============================
const [previewConfig, previewRootClassName, previewMaskClassName] = usePreviewConfig(computed(() => preview));
const [contextPreviewConfig, contextPreviewRootClassName, contextPreviewMaskClassName] = usePreviewConfig(contextPreview);

// ============================ Semantics =============================

const memoizedIcons = computed(() => ({
  ...icons,
  left: direction?.value === 'rtl' ? <RightOutlined /> : <LeftOutlined />,
  right: direction?.value === 'rtl' ? <LeftOutlined /> : <RightOutlined />,
}));

const mergedPreview = useMergedPreviewConfig(
  // Preview config
  previewConfig,
  contextPreviewConfig,

  // MISC
  prefixCls,
  mergedRootClassName,
  getContextPopupContainer,
  computed(() => icons),
);
const { mask: mergedMask, blurClassName } = toRefs(reactiveComputed(() => mergedPreview.value ?? {}));
const internalClassNames = computed(() => [
  contextClassNames?.value,
  classNames,
  {
    cover: clsx(contextPreviewMaskClassName?.value, previewMaskClassName?.value),
    popup: {
      root: clsx(contextPreviewRootClassName?.value, previewRootClassName?.value),
      mask: clsx(
        {
          [`${prefixCls.value}-preview-mask-hidden`]: !mergedMask.value,
        },
        blurClassName.value,
      ),
    },
  },
]);
const [mergedClassNames, mergedStyles] = useMergeSemantic<ImageClassNamesType, ImageStylesType, PreviewGroupProps>(
  internalClassNames,
  computed(() => [contextStyles.value, styles]),
  computed(() => ({ props: { ...otherProps, classNames, styles } })),
  computed(() => ({
    popup: {
      _default: 'root',
    },
  })),
);
</script>
<template>
  <RcImage.PreviewGroup
    v-bind="otherProps"
    :preview="mergedPreview"
    :preview-prefix-cls="previewPrefixCls"
    :icons="memoizedIcons"
    :class-names="mergedClassNames as any"
    :styles="mergedStyles"
  >
    <slot></slot>
  </RcImage.PreviewGroup>
</template>
