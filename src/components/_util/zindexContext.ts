import { inject, provide, ref, type InjectionKey, type Ref } from 'vue';

const zIndexProviderKey: InjectionKey<Ref<number | undefined>> = Symbol('zIndexProvider');

export const useZIndexContextInject = () => {
  return inject(zIndexProviderKey, ref(undefined));
};

export const useZIndexContextProvider = (zIndex: Ref<number | undefined>) => {
  return provide(zIndexProviderKey, zIndex);
};
