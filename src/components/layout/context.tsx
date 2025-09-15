import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';

export interface LayoutContextProps {
  siderHook: {
    addSider: (id: string) => void;
    removeSider: (id: string) => void;
  };
}

const LayoutContext: InjectionKey<Reactive<LayoutContextProps>> = Symbol('LayoutContext');

export const useLayoutContextInject = () => {
  return inject(
    LayoutContext,
    reactive({
      siderHook: {
        addSider: () => null,
        removeSider: () => null,
      },
    } as LayoutContextProps),
  );
};

export const useLayoutContextProvider = (props: Reactive<LayoutContextProps>) => {
  provide(LayoutContext, props);
};

export const LayoutContextProvider = defineComponent({
  props: {
    value: Object as PropType<LayoutContextProps>,
  },
  setup(props, { slots }) {
    useLayoutContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});

export interface SiderContextProps {
  siderCollapsed?: boolean;
}

const SiderContext: InjectionKey<Reactive<SiderContextProps>> = Symbol('SiderContext');

export const useSiderContextInject = () => {
  return inject(SiderContext, reactive({} as SiderContextProps));
};

export const useSiderContextProvider = (props: Reactive<SiderContextProps>) => {
  provide(SiderContext, props);
};

export const SiderContextProvider = defineComponent({
  props: {
    value: Object as PropType<SiderContextProps>,
  },
  setup(props, { slots }) {
    useSiderContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
