import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, type ComputedRef, type Ref } from 'vue';
import type { MaskType } from '../../_util/hooks/useMergedMask';
import useMergedMask from '../../_util/hooks/useMergedMask';
import { useZIndex } from '../../_util/hooks/useZIndex';
import { getTransitionName } from '../../_util/motion';
import type { PreviewConfig } from '../index.vue';
import type { GroupPreviewConfig } from '../PreviewGroup.vue';

export default function useMergedPreviewConfig<T extends PreviewConfig | GroupPreviewConfig>(
  previewConfig: Ref<T>,
  contextPreviewConfig: Ref<T>,
  prefixCls: Ref<string>,
  mergedRootClassName: Ref<string>,
  getContextPopupContainer: Ref<PreviewConfig['getContainer']>,
  icons: Ref<PreviewConfig['icons']>,
  defaultCover?: Ref<VueNode | boolean>,
): ComputedRef<
  T & {
    blurClassName?: string;
  }
> {
  const [zIndex] = useZIndex(
    'ImagePreview',
    computed(() => previewConfig?.value?.zIndex),
  );
  const maskProps = useMergedMask(
    computed(() => previewConfig?.value?.mask as MaskType),
    computed(() => contextPreviewConfig?.value?.mask as MaskType),
    computed(() => `${prefixCls.value}-preview`),
  );

  const mergedPreviewMask = computed(() => maskProps.value?.[0]);
  const blurClassName = computed(() => maskProps.value?.[1]);

  return computed(() => {
    if (!previewConfig.value) {
      return previewConfig.value;
    }
    const { cover, getContainer, closeIcon, rootClassName: previewRootClassName } = previewConfig.value as PreviewConfig;
    return {
      motionName: getTransitionName(`${prefixCls.value}-preview`, 'fade'),
      ...previewConfig.value,
      ...(defaultCover?.value ? { cover: cover ?? defaultCover.value } : {}),
      icons: icons.value,
      getContainer: getContainer ?? getContextPopupContainer.value,
      zIndex: zIndex.value,
      closeIcon,
      rootClassName: clsx(mergedRootClassName.value, previewRootClassName),
      mask: mergedPreviewMask.value,
      blurClassName: blurClassName?.value?.mask,
    };
  });
}
