import { computed, defineComponent, inject, provide, ref, type InjectionKey, type PropType, type Ref } from 'vue';

export type SizeType = 'small' | 'middle' | 'large' | undefined;

export const sizeProviderKey: InjectionKey<Ref<SizeType>> = Symbol('sizeProviderKey');

export const useSizeContextInject = () => {
  return inject(sizeProviderKey, ref<SizeType>('middle'));
};

export const useSizeContextProvider = (props: Ref<SizeType>) => {
  return provide(sizeProviderKey, props);
};

export const SizeContextProvider = defineComponent({
  props: {
    size: String as PropType<SizeType>,
  },
  setup(props, { slots }) {
    useSizeContextProvider(computed(() => props.size));
    return () => <>{slots.default?.()}</>;
  },
});
