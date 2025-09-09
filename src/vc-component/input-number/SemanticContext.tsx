import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { InputNumberProps } from './interface';

interface SemanticContextProps {
  classNames?: InputNumberProps['classNames'];
  styles?: InputNumberProps['styles'];
}

const semanticContextProviderKey: InjectionKey<Reactive<SemanticContextProps>> = Symbol('semanticContextProvider');

export const useSemanticContextInject = () => {
  return inject(semanticContextProviderKey, reactive<SemanticContextProps>({}));
};

export const useSemanticContextProvider = (props: Reactive<SemanticContextProps>) => {
  provide(semanticContextProviderKey, props);
};

export const SemanticContextProvider = defineComponent({
  props: {
    value: Object as PropType<Reactive<SemanticContextProps>>,
  },
  setup(props, { slots }) {
    useSemanticContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
