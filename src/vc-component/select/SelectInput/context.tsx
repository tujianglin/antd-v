import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { SelectInputProps } from './index.vue';

export type ContentContextProps = SelectInputProps;

const SelectInputContext: InjectionKey<Reactive<ContentContextProps>> = Symbol('SelectInputContext');

export const useSelectInputContextInject = (): Reactive<Partial<ContentContextProps>> => {
  return inject(SelectInputContext, reactive<Partial<ContentContextProps>>({}));
};

export const useSelectInputContextProvider = (props: Reactive<ContentContextProps>) => {
  provide(SelectInputContext, props);
};

export const SelectInputContextProvider = defineComponent({
  props: {
    value: Object as PropType<ContentContextProps>,
  },
  setup(props, { slots }) {
    useSelectInputContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
