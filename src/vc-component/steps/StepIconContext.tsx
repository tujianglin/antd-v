import { reactiveComputed } from '@vueuse/core';
import {
  defineComponent,
  inject,
  provide,
  reactive,
  type CSSProperties,
  type InjectionKey,
  type PropType,
  type Reactive,
} from 'vue';

export interface StepIconSemanticContextProps {
  class?: string;
  style?: CSSProperties;
}

const StepIconSemanticContext: InjectionKey<Reactive<StepIconSemanticContextProps>> = Symbol('StepIconSemanticContext');

export const useStepIconSemanticContextInject = (): Reactive<StepIconSemanticContextProps> => {
  return inject(StepIconSemanticContext, reactive({}));
};

export const useStepIconSemanticContextProvider = (props: Reactive<StepIconSemanticContextProps>) => {
  provide(StepIconSemanticContext, props);
};

export const StepIconSemanticContextProvider = defineComponent({
  props: {
    value: Object as PropType<StepIconSemanticContextProps>,
  },
  setup(props, { slots }) {
    useStepIconSemanticContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
