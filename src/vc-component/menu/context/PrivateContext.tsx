import { defineComponent, inject, provide, type InjectionKey, type PropType } from 'vue';
import type { MenuProps } from '../Menu.vue';

export interface PrivateContextProps {
  _internalRenderMenuItem?: MenuProps['_internalRenderMenuItem'];
  _internalRenderSubMenuItem?: MenuProps['_internalRenderSubMenuItem'];
}

const PrivateContext: InjectionKey<PrivateContextProps> = Symbol('PrivateContext');

export const usePrivateContextInject = () => {
  return inject(PrivateContext, {});
};

export const usePrivateContextProvider = (props: PrivateContextProps) => {
  provide(PrivateContext, props);
};

export const PrivateContextProvider = defineComponent({
  props: {
    value: Object as PropType<PrivateContextProps>,
  },
  setup(props, { slots }) {
    usePrivateContextProvider(props.value);
    return () => <>{slots?.default?.()}</>;
  },
});
