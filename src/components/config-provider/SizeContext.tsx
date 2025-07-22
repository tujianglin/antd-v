import { inject, provide, reactive, ref, type InjectionKey, type Reactive, type Ref } from 'vue';

export type SizeType = 'small' | 'middle' | 'large' | undefined;

export interface SizeContextProps {
  size?: Ref<SizeType>;
}

export const sizeProviderKey: InjectionKey<Reactive<SizeContextProps>> = Symbol('sizeProviderKey');

export const useSizeContextInject = () => {
  const size = ref<SizeType>('middle');
  return inject(sizeProviderKey, reactive<SizeContextProps>({ size }));
};

export const useSizeContextProvider = (props: Reactive<SizeContextProps>) => {
  return provide(sizeProviderKey, props);
};
