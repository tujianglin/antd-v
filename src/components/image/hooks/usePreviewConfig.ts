import { isValidElement } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import { computed, type ComputedRef, type Ref } from 'vue';
import type { MaskType } from '../../_util/hooks/useMergedMask';
import type { PreviewConfig } from '../index.vue';
import type { GroupPreviewConfig } from '../PreviewGroup.vue';

function normalizeMask(mask?: MaskType | VueNode) {
  if (isValidElement(mask)) {
    return [mask, undefined];
  }
  if (typeof mask === 'boolean' || (mask && typeof mask === 'object')) {
    return [undefined, mask];
  }
  return [undefined, undefined];
}

export default function usePreviewConfig<T extends PreviewConfig | GroupPreviewConfig>(
  preview?: Ref<boolean | T>,
): [previewConfig: ComputedRef<T>, rootClassName: ComputedRef<string>, maskClassName: ComputedRef<string>] {
  // Get origin preview config
  const rawPreviewConfig = computed(() => {
    if (typeof preview?.value === 'boolean') {
      return preview?.value ? {} : null;
    }

    return preview?.value && typeof preview?.value === 'object' ? preview?.value : {};
  });

  const splittedPreviewConfig = computed(() => {
    if (!rawPreviewConfig.value) {
      return [rawPreviewConfig.value, '', ''];
    }

    const {
      open,
      onOpenChange,
      cover,
      actionsRender,

      rootClassName,
      mask,
      ...restPreviewConfig
    } = rawPreviewConfig.value as GroupPreviewConfig & Pick<PreviewConfig, 'cover' | 'mask'>;

    let onInternalOpenChange: typeof onOpenChange;
    if (onOpenChange) {
      onInternalOpenChange = onOpenChange;
    }

    const [coverElement, maskConfig] = normalizeMask(mask);

    return [
      {
        ...restPreviewConfig,
        open,
        onOpenChange: onInternalOpenChange,
        cover: cover ?? coverElement,
        mask: maskConfig,
        actionsRender,
      },
      rootClassName,
    ];
  });
  return [
    computed(() => splittedPreviewConfig.value?.[0] as T),
    computed(() => splittedPreviewConfig.value?.[1] as string),
    computed(() => splittedPreviewConfig.value?.[2] as string),
  ];
}
