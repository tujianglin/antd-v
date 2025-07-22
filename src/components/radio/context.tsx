import { reactiveComputed } from '@vueuse/core';
import {
  computed,
  defineComponent,
  inject,
  provide,
  reactive,
  ref,
  type InjectionKey,
  type PropType,
  type Reactive,
  type Ref,
} from 'vue';
import type { RadioGroupContextProps, RadioOptionTypeContextProps } from './interface';

const RadioGroupContext: InjectionKey<Reactive<RadioGroupContextProps> | null> = Symbol('RadioGroupContext');

export const useRadioGroupContextInject = () => {
  return inject(RadioGroupContext, reactive<Partial<RadioGroupContextProps>>({}));
};

export const useRadioGroupContextProvider = (props: Reactive<RadioGroupContextProps>) => {
  provide(RadioGroupContext, props);
};

export const RadioGroupContextProvider = defineComponent({
  props: {
    value: Object as PropType<RadioGroupContextProps>,
  },
  setup(props, { slots }) {
    useRadioGroupContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});

const RadioOptionTypeContext: InjectionKey<Ref<RadioOptionTypeContextProps>> = Symbol('RadioOptionTypeContext');

export const useRadioOptionTypeContextInject = () => {
  return inject(RadioOptionTypeContext, ref<RadioOptionTypeContextProps>('default'));
};

export const useRadioOptionTypeContextProvider = (props: Ref<RadioOptionTypeContextProps>) => {
  provide(RadioOptionTypeContext, props);
};

export const RadioOptionTypeContextProvider = defineComponent({
  props: {
    value: String as PropType<RadioOptionTypeContextProps>,
  },
  setup(props, { slots }) {
    useRadioOptionTypeContextProvider(computed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
