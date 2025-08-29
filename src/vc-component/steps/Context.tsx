import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { StepsProps } from './Steps.vue';

export interface StepsContextProps {
  prefixCls?: string;
  classNames?: NonNullable<StepsProps['classNames']>;
  styles?: NonNullable<StepsProps['styles']>;
  ItemComponent?: any;
}

const StepsContext: InjectionKey<Reactive<StepsContextProps>> = Symbol('StepsContext');

export const useStepsContextInject = (): Reactive<StepsContextProps> => {
  return inject(StepsContext, reactive({}));
};

export const useStepsContextProvider = (props: Reactive<StepsContextProps>) => {
  provide(StepsContext, props);
};

export const StepsContextProvider = defineComponent({
  props: {
    value: Object as PropType<StepsContextProps>,
  },
  setup(props, { slots }) {
    useStepsContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
