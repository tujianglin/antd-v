import { reactiveComputed } from '@vueuse/core';
import type { ComputedRef } from 'vue';
import { useConfigContextInject, Variants, type Variant } from '../../config-provider/context';
import type { ConfigProviderProps } from '../../config-provider/interface';
import { useVariantContextInject } from '../context';

type VariantComponents = keyof Pick<ConfigProviderProps, 'input' | 'textArea' | 'inputNumber'>;

/**
 * Compatible for legacy `bordered` prop.
 */
const useVariant = (
  component: VariantComponents,
  variant: ComputedRef<Variant | undefined>,
): { variant: Variant; enableVariantCls: boolean } => {
  const { variant: configVariant, [component]: componentConfig } = useConfigContextInject();
  const ctxVariant = useVariantContextInject();
  return reactiveComputed(() => {
    const configComponentVariant = componentConfig?.variant;

    let mergedVariant: Variant;
    if (typeof variant.value !== 'undefined') {
      mergedVariant = variant.value;
    } else {
      // form variant > component global variant > global variant
      mergedVariant = ctxVariant.value ?? configComponentVariant ?? configVariant ?? 'outlined';
    }

    const enableVariantCls = Variants.includes(mergedVariant);
    return { variant: mergedVariant, enableVariantCls };
  });
};

export default useVariant;
