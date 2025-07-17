import { reactiveComputed } from '@vueuse/core';
import { inject, provide, type InjectionKey, type Reactive } from 'vue';
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
  return inject(
    groupProviderKey,
    reactiveComputed(() => ({}) as GroupContextProps),
  );
};

export const useGroupContextProvider = (props: Reactive<GroupContextProps>) => {
  provide(groupProviderKey, props);
};
