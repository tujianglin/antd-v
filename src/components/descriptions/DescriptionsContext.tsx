export type SemanticName = 'label' | 'content';
export interface DescriptionsContextProps {
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  classNames?: Partial<Record<SemanticName, string>>;
}

import { reactiveComputed } from '@vueuse/core';
import {
  defineComponent,
  inject,
  provide,
  reactive,
  type CSSProperties,
  type InjectionKey,
  type PropType,
  type Reactive,
} from 'vue';

const DescriptionsContext: InjectionKey<Reactive<DescriptionsContextProps>> = Symbol('DescriptionsContext');

export const useDescriptionsContextInject = () => {
  return inject(DescriptionsContext, reactive({} as DescriptionsContextProps));
};

export const useDescriptionsContextProvider = (props: Reactive<DescriptionsContextProps>) => {
  return provide(DescriptionsContext, props);
};

export const DescriptionsContextProvider = defineComponent({
  props: {
    value: {
      type: Object as PropType<DescriptionsContextProps>,
    },
  },
  setup(props, { slots }) {
    useDescriptionsContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
