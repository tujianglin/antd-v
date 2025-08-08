import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { Locale } from '.';

export type LocaleContextProps = Locale & { exist?: boolean };

const LocaleContext: InjectionKey<Reactive<LocaleContextProps>> = Symbol('LocaleContext');

export const useLocaleContextInject = () => {
  return inject(LocaleContext, reactive({} as LocaleContextProps));
};

export const useLocaleContextProvider = (props: Reactive<LocaleContextProps>) => {
  provide(LocaleContext, props);
};

export const LocaleContextProvider = defineComponent({
  props: {
    value: Object as PropType<LocaleContextProps>,
  },
  setup(props, { slots }) {
    useLocaleContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
