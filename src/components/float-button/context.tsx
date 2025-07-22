import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { FloatButtonProps, FloatButtonShape } from './interface';

export interface GroupContextProps {
  shape: FloatButtonShape;
  /** Current Buttons are in same container or individual */
  individual: boolean;
  /** FloatButton classNames */
  classNames?: FloatButtonProps['classNames'];
  /** FloatButton styles */
  styles?: FloatButtonProps['styles'];
}

const groupProviderKey: InjectionKey<Reactive<GroupContextProps>> = Symbol('groupProvider');

export const useGroupContextInject = () => {
  return inject(groupProviderKey, reactive<Partial<GroupContextProps>>({}));
};

export const useGroupContextProvider = (props: Reactive<GroupContextProps>) => {
  provide(groupProviderKey, props);
};

export const GroupContextProvider = defineComponent({
  props: {
    value: Object as PropType<GroupContextProps>,
  },
  setup(props, { slots }) {
    useGroupContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
