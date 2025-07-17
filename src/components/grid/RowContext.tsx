import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, type InjectionKey, type PropType, type Reactive } from 'vue';

export interface RowContextState {
  gutter?: [number, number];
  wrap?: boolean;
}

const rowContextProviderKey: InjectionKey<Reactive<RowContextState>> = Symbol('rowContextProvider');

export const useRowContextInject = () => {
  return inject(
    rowContextProviderKey,
    reactiveComputed((): RowContextState => ({})),
  );
};

export const useRowContextProvider = (props: Reactive<RowContextState>) => {
  provide(rowContextProviderKey, props);
};

export const RowContextProvider = defineComponent({
  props: {
    value: {
      type: Object as PropType<Reactive<RowContextState>>,
      required: true,
    },
  },
  setup(props, { slots }) {
    useRowContextProvider(props.value);
    return () => <>{slots.default?.()}</>;
  },
});
