import { reactiveComputed } from '@vueuse/core';
import {
  computed,
  defineComponent,
  inject,
  provide,
  reactive,
  type ComputedRef,
  type InjectionKey,
  type PropType,
  type Reactive,
} from 'vue';
import type { GetComponent, TableSticky } from '../interface';
export interface StaticContextProps {
  scrollY: number;
  listItemHeight: number;
  sticky: boolean | TableSticky;
  getComponent: GetComponent;
  onScroll?: (e: UIEvent) => void;
}

// TableContext 类型，每个属性是 ComputedRef
export type TableContextType = {
  [K in keyof StaticContextProps]: ComputedRef<StaticContextProps[K]>;
};

// InjectionKey
const StaticContext: InjectionKey<TableContextType> = Symbol('StaticContext');

// Inject hook
export const useStaticContextInject = (): Partial<TableContextType> => {
  return inject(StaticContext, null) as Partial<TableContextType>;
};

// Provider helper
export const useStaticContextProvider = (props: ComputedRef<StaticContextProps>) => {
  const state = {};

  // 每个属性独立 computed
  (Object.keys(props.value) as Array<keyof StaticContextProps>).forEach((key) => {
    state[key] = computed(() => props.value[key]);
  });

  provide(StaticContext, state as TableContextType);
};

// TableContextProvider 组件
export const StaticContextProvider = defineComponent({
  props: {
    value: {
      type: Object as PropType<StaticContextProps>,
      required: true,
    },
  },
  setup(props, { slots }) {
    useStaticContextProvider(computed(() => props.value as StaticContextProps));
    return () => slots.default?.();
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
    return () => slots.default?.();
  },
});
