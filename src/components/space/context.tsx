import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { SpaceCompactItemContextType } from './CompactContext';

export interface SpaceContextType {
  latestIndex: number;
}

const SpaceContext: InjectionKey<Reactive<SpaceContextType>> = Symbol('SpaceContext');

export const useSpaceContextInject = () => {
  return inject(SpaceContext, reactive<SpaceContextType>({ latestIndex: 0 }));
};

export const useSpaceContextProvider = (props: Reactive<SpaceContextType>) => {
  provide(SpaceContext, props);
};

export const SpaceContextProvider = defineComponent({
  props: {
    value: Object as PropType<SpaceContextType>,
  },
  setup(props, { slots }) {
    useSpaceContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});

const SpaceCompactItemContex: InjectionKey<Reactive<SpaceCompactItemContextType>> = Symbol('SpaceCompactItemContex');

export const useSpaceCompactItemContextInject = () => {
  return inject(SpaceCompactItemContex, reactive({}));
};

export const useSpaceCompactItemContextProvider = (props: Reactive<SpaceCompactItemContextType>) => {
  provide(SpaceCompactItemContex, props);
};

export const SpaceCompactItemContextProvider = defineComponent({
  props: {
    value: Object as PropType<SpaceCompactItemContextType>,
  },
  setup(props, { slots }) {
    useSpaceCompactItemContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});

export const NoCompactStyle = defineComponent({
  setup(_, { slots }) {
    return () => <SpaceCompactItemContextProvider value={{}}>{slots.default?.()}</SpaceCompactItemContextProvider>;
  },
});
