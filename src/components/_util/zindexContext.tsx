import { computed, defineComponent, inject, provide, ref, type InjectionKey, type Ref } from 'vue';

const zIndexContext: InjectionKey<Ref<number | undefined>> = Symbol('zIndexContext');

export const useZIndexContextInject = () => {
  return inject(zIndexContext, ref(undefined));
};

export const useZIndexContextProvider = (zIndex: Ref<number | undefined>) => {
  return provide(zIndexContext, zIndex);
};

export const ZIndexContextProvider = defineComponent({
  props: {
    value: Number,
  },
  setup(props, { slots }) {
    useZIndexContextProvider(computed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
