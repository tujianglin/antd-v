import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';

export interface PerfRecord {
  renderWithProps: boolean;
}

const PerfContext: InjectionKey<Reactive<PerfRecord>> = Symbol('PerfContext');

export const usePerfContextInject = (): Reactive<Partial<PerfRecord>> => {
  return inject(
    PerfContext,
    reactive<Partial<PerfRecord>>({
      renderWithProps: false,
    }),
  );
};

export const usePerfContextProvider = (props: Reactive<PerfRecord>) => {
  provide(PerfContext, props);
};

export const PerfContextProvider = defineComponent({
  props: {
    value: Object as PropType<PerfRecord>,
  },
  setup(props, { slots }) {
    usePerfContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});

export default PerfContext;
