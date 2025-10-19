import { computed, type ComputedRef, type Ref } from 'vue';

export interface MaskConfig {
  enabled?: boolean;
  blur?: boolean;
}
export type MaskType = MaskConfig | boolean;

const normalizeMaskConfig = (mask?: MaskType): MaskConfig => {
  if (mask && typeof mask === 'object') {
    return mask;
  }
  if (typeof mask === 'boolean') {
    return {
      enabled: !!mask,
      blur: !!mask,
    };
  }
  return {};
};

function useMergedMask(
  mask?: Ref<MaskType>,
  contextMask?: Ref<MaskType>,
  prefixCls?: Ref<string>,
): ComputedRef<[boolean, { [key: string]: string | undefined }]> {
  return computed(() => {
    const maskConfig = normalizeMaskConfig(mask.value);
    const contextMaskConfig = normalizeMaskConfig(contextMask.value);

    const mergedConfig: MaskConfig = {
      ...contextMaskConfig,
      ...maskConfig,
    };

    const className = mergedConfig.blur !== false ? `${prefixCls.value}-mask-blur` : undefined;

    return [mergedConfig.enabled !== false, { mask: className }];
  });
}

export default useMergedMask;
