import { computed, defineComponent, inject, provide, ref, type InjectionKey, type Ref } from 'vue';

const MotionCacheContext: InjectionKey<Ref<boolean>> = Symbol('MotionCacheContext');

export const useMotionCacheContextInject = () => {
  return inject(MotionCacheContext, ref(false));
};

export const useMotionCacheContextProvider = (props: Ref<boolean>) => {
  return provide(MotionCacheContext, props);
};

export const MotionCacheContextProvider = defineComponent({
  props: {
    value: {
      type: Boolean,
    },
  },
  setup(props, { slots }) {
    useMotionCacheContextProvider(computed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
