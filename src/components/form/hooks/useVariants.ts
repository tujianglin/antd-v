import { computed, toRefs, type ComputedRef } from 'vue';
import { useConfigContextInject, Variants, type Variant } from '../../config-provider/context';
import type { ConfigProviderProps } from '../../config-provider/interface';
import { useVariantContextInject } from '../context';

type VariantComponents = keyof Pick<
  ConfigProviderProps,
  'input' | 'inputNumber' | 'select' | 'datePicker' | 'rangePicker' | 'timePicker' | 'textArea' | 'card' | 'mentions'
>;
/**
 * Compatible for legacy `bordered` prop.
 */
const useVariant = (
  component: VariantComponents,
  variant: ComputedRef<Variant | undefined>,
): [ComputedRef<Variant>, ComputedRef<boolean>] => {
  const { variant: configVariant, [component]: componentConfig } = toRefs(useConfigContextInject());
  const ctxVariant = useVariantContextInject();

  const configComponentVariant = computed(() => componentConfig?.value?.variant);

  const mergedVariant = computed(() => {
    let result;
    if (typeof variant.value !== 'undefined') {
      result = variant.value;
    } else {
      // form variant > component global variant > global variant
      result = ctxVariant?.value ?? configComponentVariant?.value ?? configVariant?.value ?? 'outlined';
    }
    return result;
  });

  const enableVariantCls = computed(() => Variants.includes(mergedVariant.value));
  return [mergedVariant, enableVariantCls];
};

export default useVariant;
