import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';

export interface DrawerContextProps {
  pushDistance?: number | string;
  push?: VoidFunction;
  pull?: VoidFunction;
}

const DrawerContext: InjectionKey<Reactive<DrawerContextProps>> = Symbol('DrawerContext');

export const useDrawerContextInject = (): Reactive<DrawerContextProps> => {
  return inject(DrawerContext, reactive({}));
};

export const useDrawerContextProvider = (props: Reactive<DrawerContextProps>) => {
  provide(DrawerContext, props);
};

export const DrawerContextProvider = defineComponent({
  props: {
    value: Object as PropType<DrawerContextProps>,
  },
  setup(props, { slots }) {
    useDrawerContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});

export interface RefContextProps {
  panel?: HTMLDivElement;
}

const RefContext: InjectionKey<Reactive<RefContextProps>> = Symbol('RefContext');

export const useRefContextInject = (): Reactive<RefContextProps> => {
  return inject(RefContext, reactive({}));
};

export const useRefContextProvider = (props: Reactive<RefContextProps>) => {
  provide(RefContext, props);
};

export const RefContextProvider = defineComponent({
  props: {
    value: Object as PropType<RefContextProps>,
  },
  setup(props, { slots }) {
    useRefContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
