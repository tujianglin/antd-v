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

export type SemanticName = 'root' | 'item' | 'separator';
export interface BreadcrumbContextProps {
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  classNames?: Partial<Record<SemanticName, string>>;
}

const BreadcrumbContext: InjectionKey<Reactive<BreadcrumbContextProps>> = Symbol('BreadcrumbContext');

export const useBreadcrumbContextInject = () => {
  return inject(BreadcrumbContext, reactive<Partial<BreadcrumbContextProps>>({}));
};

export const useBreadcrumbContextProvider = (props: Reactive<BreadcrumbContextProps>) => {
  provide(BreadcrumbContext, props);
};

export const BreadcrumbContextProvider = defineComponent({
  props: {
    value: Object as PropType<BreadcrumbContextProps>,
  },
  setup(props, { slots }) {
    useBreadcrumbContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
