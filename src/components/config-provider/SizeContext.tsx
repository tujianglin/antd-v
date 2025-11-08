import { computed, defineComponent, inject, provide, ref, type InjectionKey, type PropType, type Ref } from 'vue';

export type SizeType = 'small' | 'middle' | 'large' | undefined;

const SizeContext: InjectionKey<Ref<SizeType>> = Symbol('SizeContext');

export const useSizeContextInject = () => {
  return inject(SizeContext, ref<SizeType>(undefined));
};

export const useSizeContextProvider = (props: Ref<SizeType>) => {
  return provide(SizeContext, props);
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
