import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';

export interface RowContextState {
  gutter?: [number, number];
  wrap?: boolean;
}

const rowContextProviderKey: InjectionKey<Reactive<RowContextState>> = Symbol('rowContextProvider');

export const useRowContextInject = () => {
  return inject(rowContextProviderKey, reactive<RowContextState>({}));
};

export const useRowContextProvider = (props: Reactive<RowContextState>) => {
  provide(rowContextProviderKey, props);
};

export const RowContextProvider = defineComponent({
  props: {
    value: Object as PropType<RowContextState>,
  },
  setup(props, { slots }) {
    useRowContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
