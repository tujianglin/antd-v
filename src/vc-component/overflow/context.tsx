import type { VueKey } from '@/vc-util/type';
import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';

type OverflowContextProps = {
  prefixCls: string;
  responsive: boolean;
  order: number;
  registerSize: (key: VueKey, width: number | null) => void;
  display: boolean;

  invalidate: boolean;

  // Item Usage
  item?: any;
  itemKey?: VueKey;

  // Rest Usage
  class?: string;
};

const OverflowContext: InjectionKey<Reactive<OverflowContextProps>> = Symbol('OverflowContext');

export const useOverflowContextInject = () => {
  return inject(OverflowContext, reactive({} as OverflowContextProps));
};

export const useOverflowContextProvider = (props: Reactive<OverflowContextProps>) => {
  provide(OverflowContext, props);
};

export const OverflowContextProvider = defineComponent({
  props: {
    value: [Object, null] as PropType<OverflowContextProps>,
  },
  setup(props, { slots }) {
    useOverflowContextProvider(reactiveComputed(() => props.value || ({} as any)));
    return () => <>{slots.default?.()}</>;
  },
});
