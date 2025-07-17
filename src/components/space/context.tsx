import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { SpaceCompactItemContextType } from './CompactContext';

export interface SpaceContextType {
  latestIndex: number;
}

const spaceContextProviderKey: InjectionKey<Reactive<SpaceContextType>> = Symbol('spaceContextProvider');

export const useSpaceContextInject = () => {
  return inject(
    spaceContextProviderKey,
    reactiveComputed(() => ({ latestIndex: 0 })),
  );
};

export const useSpaceContextProvider = (props: Reactive<SpaceContextType>) => {
  provide(spaceContextProviderKey, props);
};

export const SpaceContextProvider = defineComponent({
  props: {
    value: {
      type: Object as PropType<SpaceContextType>,
      required: true,
    },
  },
  setup(props, { slots }) {
    useSpaceContextProvider(props.value);
    return () => <>{slots.default?.()}</>;
  },
});

const spaceCompactItemContextProviderKey: InjectionKey<Reactive<SpaceCompactItemContextType>> = Symbol(
  'spaceCompactItemContextProvider',
);

export const useSpaceCompactItemContextInject = () => {
  return inject(
    spaceCompactItemContextProviderKey,
    reactiveComputed(() => null),
  );
};

export const useSpaceCompactItemContextProvider = (props: Reactive<SpaceCompactItemContextType>) => {
  provide(spaceCompactItemContextProviderKey, props);
};

export const SpaceCompactItemContextProvider = defineComponent({
  props: {
    value: {
      type: [Object, null] as PropType<SpaceCompactItemContextType | null>,
      required: true,
    },
  },
  setup(props, { slots }) {
    useSpaceCompactItemContextProvider(props.value);
    return () => <>{slots.default?.()}</>;
  },
});

export const NoCompactStyle = (_, { slots }) => {
  return <SpaceCompactItemContextProvider value={null}>{slots.default?.()}</SpaceCompactItemContextProvider>;
};
