import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { GenerateConfig } from '../generate';
import type { FilledClassNames, FilledStyles } from '../hooks/useSemantic';
import type { Components, Locale } from '../interface';

export interface PickerContextProps<DateType = any> {
  prefixCls: string;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  /** Customize button component */
  button?: Components['button'];
  input?: Components['input'];
  classNames: FilledClassNames;
  styles: FilledStyles;
}

const PickerContext: InjectionKey<Reactive<PickerContextProps>> = Symbol('PickerContext');

export const usePickerContextInject = (): Reactive<Partial<PickerContextProps>> => {
  return inject(PickerContext, reactive<Partial<PickerContextProps>>({}));
};

export const usePickerContextProvider = (props: Reactive<PickerContextProps>) => {
  provide(PickerContext, props);
};

export const PickerContextProvider = defineComponent({
  props: {
    value: Object as PropType<PickerContextProps>,
  },
  setup(props, { slots }) {
    usePickerContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
