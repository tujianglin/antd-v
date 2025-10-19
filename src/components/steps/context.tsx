import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';

export interface InternalContextProps {
  rootComponent: string;
  itemComponent: string;
}

/**
 * When use this context. Will trade as sub component instead of root Steps component.
 */

const InternalContext: InjectionKey<Reactive<InternalContextProps>> = Symbol('InternalContext');

export const useInternalContextInject = () => {
  return inject(InternalContext, reactive<Partial<InternalContextProps>>({}));
};

export const useInternalContextProvider = (props: Reactive<InternalContextProps>) => {
  provide(InternalContext, props);
};

export const InternalContextProvider = defineComponent({
  props: {
    value: Object as PropType<InternalContextProps>,
  },
  setup(props, { slots }) {
    useInternalContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
