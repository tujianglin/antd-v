import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { ConfigOptions as MessageConfig } from '../message/interface';
// import type { HookAPI as ModalHookAPI } from '../modal/useModal';
import type { NotificationConfig, NotificationInstance } from '../notification/interface';

export interface AppConfig {
  message?: MessageConfig;
  notification?: NotificationConfig;
}

const AppConfigContext: InjectionKey<Reactive<AppConfig>> = Symbol('AppConfigContext');

export const useAppConfigContextInject = () => {
  return inject(AppConfigContext, reactive({} as AppConfig));
};

export const useAppConfigContextProvider = (props: Reactive<AppConfig>) => {
  return provide(AppConfigContext, props);
};

export const AppConfigContextProvider = defineComponent({
  props: {
    value: {
      type: Object as PropType<AppConfig>,
    },
  },
  setup(props, { slots }) {
    useAppConfigContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});

export interface useAppProps {
  // message: MessageInstance;
  notification: NotificationInstance;
  // modal: ModalHookAPI;
}

const AppContext: InjectionKey<Reactive<useAppProps>> = Symbol('AppContext');

export const useAppContextInject = () => {
  return inject(
    AppContext,
    reactive({
      // message: {},
      notification: {},
      // modal: {},
    } as useAppProps),
  );
};

export const useAppContextProvider = (props: Reactive<useAppProps>) => {
  return provide(AppContext, props);
};

export const AppContextProvider = defineComponent({
  props: {
    value: {
      type: Object as PropType<useAppProps>,
    },
  },
  setup(props, { slots }) {
    useAppContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});

export const useApp = () => useAppContextInject();
