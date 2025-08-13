import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';

interface MotionContextProps {
  motion?: boolean;
}

const Context: InjectionKey<Reactive<MotionContextProps>> = Symbol('MotionContext');

export const useContextInject = (): MotionContextProps => {
  return inject(Context, reactive({}));
};

export const useContextProvider = (props: Reactive<MotionContextProps>) => {
  provide(Context, props);
};

export const MotionProvider = defineComponent({
  props: {
    value: Object as PropType<MotionContextProps>,
  },
  setup(props, { slots }) {
    useContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
