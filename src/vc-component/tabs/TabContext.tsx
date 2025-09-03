import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { Tab } from './interface';

export interface TabContextProps {
  tabs: Tab[];
  prefixCls: string;
}

const TabContext: InjectionKey<Reactive<TabContextProps>> = Symbol('TabContext');

export const useTabContextInject = () => {
  return inject(TabContext, reactive<Partial<TabContextProps>>({}));
};

export const useTabContextProvider = (props: Reactive<TabContextProps>) => {
  provide(TabContext, props);
};

export const TabContextProvider = defineComponent({
  props: {
    value: Object as PropType<TabContextProps>,
  },
  setup(props, { slots }) {
    useTabContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
