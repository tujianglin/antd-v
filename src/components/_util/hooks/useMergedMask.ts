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
): [ComputedRef<boolean>, ComputedRef<{ [key: string]: string | undefined }>] {
  const data = computed(() => {
    const maskConfig = normalizeMaskConfig(mask.value);
    const contextMaskConfig = normalizeMaskConfig(contextMask?.value);

    const mergedConfig: MaskConfig = {
      ...contextMaskConfig,
      ...maskConfig,
    };

    const className = mergedConfig.blur !== false ? `${prefixCls.value}-mask-blur` : undefined;

    return [mergedConfig.enabled !== false, { mask: className }];
  });

  return [computed(() => data.value?.[0] as boolean), computed(() => data.value?.[1] as { [key: string]: string | undefined })];
}

export default useMergedMask;
