import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';

export interface NotificationContextProps {
  classNames?: {
    notice?: string;
    list?: string;
  };
}

const NotificationContext: InjectionKey<Reactive<NotificationContextProps>> = Symbol('NotificationContext');

export const useNotificationContextInject = (): Reactive<NotificationContextProps> => {
  return inject(NotificationContext, reactive({}));
};

export const useNotificationContextProvider = (props: Reactive<NotificationContextProps>) => {
  provide(NotificationContext, props);
};

export const NotificationContextProvider = defineComponent({
  props: {
    value: Object as PropType<NotificationContextProps>,
  },
  setup(props, { slots }) {
    useNotificationContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
