/**
 * BaseSelect provide some parsed data into context.
 * You can use this hooks to get them.
 */

import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { BaseSelectProps } from '../BaseSelect/interface';

export interface BaseSelectContextProps extends BaseSelectProps {
  triggerOpen: boolean;
  multiple: boolean;
  toggleOpen: (open?: boolean) => void;
  open: boolean;
}

const BaseSelectContext: InjectionKey<Reactive<BaseSelectContextProps>> = Symbol('BaseSelectContext');

export const useBaseSelectContextInject = (): Partial<BaseSelectContextProps> => {
  return inject(BaseSelectContext, reactive({}));
};

export const useBaseSelectContextProvider = (props: Reactive<BaseSelectContextProps>) => {
  provide(BaseSelectContext, props);
};

export const BaseSelectContextProvider = defineComponent({
  props: {
    value: Object as PropType<BaseSelectContextProps>,
  },
  setup(props, { slots }) {
    useBaseSelectContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
