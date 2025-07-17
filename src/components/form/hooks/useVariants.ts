import { reactiveComputed } from '@vueuse/core';
import { useConfigContextInject, Variants, type Variant } from '../../config-provider/context';
import type { ConfigProviderProps } from '../../config-provider/interface';
import { useVariantContextInject } from '../context';

type VariantComponents = keyof Pick<ConfigProviderProps, 'input'>;

/**
 * Compatible for legacy `bordered` prop.
 */
const useVariant = (
  component: VariantComponents,
  variant: Variant | undefined,
  legacyBordered: boolean | undefined = undefined,
): { variant: Variant; enableVariantCls: boolean } => {
  const { variant: configVariant, [component]: componentConfig } = useConfigContextInject();
  const ctxVariant = useVariantContextInject();
  return reactiveComputed(() => {
    const configComponentVariant = componentConfig?.variant;

    let mergedVariant: Variant;
    if (typeof variant !== 'undefined') {
      mergedVariant = variant;
    } else if (legacyBordered === false) {
      mergedVariant = 'borderless';
    } else {
      // form variant > component global variant > global variant
      mergedVariant = ctxVariant ?? configComponentVariant ?? configVariant ?? 'outlined';
    }

    const enableVariantCls = Variants.includes(mergedVariant);
    return { variant: mergedVariant, enableVariantCls };
  });
};

export default useVariant;
