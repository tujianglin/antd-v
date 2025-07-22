import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { CheckboxOptionType } from './interface';

export interface CheckboxGroupContext<T = any> {
  name?: string;
  toggleOption?: (option: CheckboxOptionType<T>) => void;
  value?: any;
  disabled?: boolean;
  registerValue: (val) => void;
  cancelValue: (val) => void;
}

const CheckboxGroupContext: InjectionKey<Reactive<CheckboxGroupContext> | null> = Symbol('CheckboxGroupContext');

export const useCheckboxGroupContextInject = () => {
  return inject(CheckboxGroupContext, reactive<Partial<CheckboxGroupContext>>({}));
};

export const useCheckboxGroupContextProvider = (props: Reactive<CheckboxGroupContext>) => {
  provide(CheckboxGroupContext, props);
};

export const CheckboxGroupContextProvider = defineComponent({
  props: {
    value: Object as PropType<CheckboxGroupContext>,
  },
  setup(props, { slots }) {
    useCheckboxGroupContextProvider(reactiveComputed(() => props.value));
    return () => slots.default?.();
  },
});
