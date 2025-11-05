import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { GetComponent, TableSticky } from '../interface';
export interface StaticContextProps {
  scrollY: number;
  listItemHeight: number;
  sticky: boolean | TableSticky;
  getComponent: GetComponent;
  onScroll?: (e: UIEvent) => void;
}

const StaticContext: InjectionKey<Reactive<StaticContextProps>> = Symbol('StaticContext');

export const useStaticContextInject = (): Reactive<Partial<StaticContextProps>> => {
  return inject(StaticContext, reactive<Partial<StaticContextProps>>({}));
};

export const useStaticContextProvider = (props: Reactive<StaticContextProps>) => {
  provide(StaticContext, props);
};

export const StaticContextProvider = defineComponent({
  props: {
    value: Object as PropType<StaticContextProps>,
  },
  setup(props, { slots }) {
    useStaticContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});

export interface GridContextProps {
  columnsOffset: number[];
}

const GridContext: InjectionKey<Reactive<GridContextProps>> = Symbol('GridContext');

export const useGridContextInject = (): Reactive<Partial<GridContextProps>> => {
  return inject(GridContext, reactive<Partial<GridContextProps>>({}));
};

export const useGridContextProvider = (props: Reactive<GridContextProps>) => {
  provide(GridContext, props);
};

export const GridContextProvider = defineComponent({
  props: {
    value: Object as PropType<GridContextProps>,
  },
  setup(props, { slots }) {
    useGridContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
