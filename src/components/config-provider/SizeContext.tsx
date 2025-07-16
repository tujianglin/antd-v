import { inject, provide, ref, type InjectionKey, type Ref } from 'vue';

export type SizeType = 'small' | 'middle' | 'large' | undefined;

export interface SizeContextProps {
  size?: Ref<SizeType>;
}

export const sizeProviderKey: InjectionKey<SizeContextProps> = Symbol('sizeProviderKey');

export const useSizeContextInject = () => {
  const size = ref<SizeType>('middle');
  return inject(sizeProviderKey, { size });
};

export const useSizeContextProvider = (props: SizeContextProps) => {
  return provide(sizeProviderKey, props);
};
