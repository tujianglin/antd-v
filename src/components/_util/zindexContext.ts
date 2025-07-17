import { inject, provide, type InjectionKey } from 'vue';

const zIndexProviderKey: InjectionKey<number | undefined> = Symbol('zIndexProvider');

export const useZIndexContextInject = () => {
  return inject(zIndexProviderKey, undefined);
};

export const useZIndexContextProvider = (zIndex: number | undefined) => {
  return provide(zIndexProviderKey, zIndex);
};
