import { defineComponent, inject, provide, type InjectionKey, type PropType } from 'vue';
import type { InternalNamePath } from './interface';

export interface ListContextProps {
  getKey: (namePath: InternalNamePath) => [InternalNamePath[number], InternalNamePath];
}

const ListContext: InjectionKey<ListContextProps> = Symbol('ListContext');

// 提供便捷的 useListContext hook
export const useListContextInject = () => {
  return inject(ListContext, null);
};

export const useListContextProvider = (form: ListContextProps) => {
  return provide(ListContext, form);
};

export const ListContextProvider = defineComponent({
  name: 'ListContextProvider',
  props: {
    value: Object as PropType<ListContextProps>,
  },
  setup(props, { slots }) {
    useListContextProvider(props.value);
    return () => slots.default?.();
  },
});

export { ListContextProvider as default };
