import { inject, provide, ref, type InjectionKey, type Ref } from 'vue';
import type { Variant } from '../config-provider/context';

const variantContextProviderKey: InjectionKey<Ref<Variant | undefined>> = Symbol('variantContextProvider');

export const useVariantContextInject = () => {
  return inject(variantContextProviderKey, ref(undefined));
};
export const useVariantContextProvider = (props: Ref<Variant | undefined>) => {
  provide(variantContextProviderKey, props);
};
