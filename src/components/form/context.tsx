import { inject, provide, type InjectionKey } from 'vue';
import type { Variant } from '../config-provider/context';

const variantContextProviderKey: InjectionKey<Variant | undefined> = Symbol('variantContextProvider');

export const useVariantContextInject = () => {
  return inject(variantContextProviderKey, undefined);
};
export const useVariantContextProvider = (props: Variant) => {
  provide(variantContextProviderKey, props);
};
