import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';

export interface RefContextProps {
  panel?: HTMLDivElement;
}

const RefContext: InjectionKey<Reactive<RefContextProps>> = Symbol('RefContext');

export const useRefContextInject = (): Reactive<RefContextProps> => {
  return inject(RefContext, reactive({}));
};

export const useRefContextProvider = (props: Reactive<RefContextProps>) => {
  provide(RefContext, props);
};

export const RefContextProvider = defineComponent({
  props: {
    value: Object as PropType<RefContextProps>,
  },
  setup(props, { slots }) {
    useRefContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
