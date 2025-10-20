import type { ConfirmCancelBtnProps } from './components/ConfirmCancelBtn.vue';
import type { ConfirmOkBtnProps } from './components/ConfirmOkBtn.vue';
import type { NormalCancelBtnProps } from './components/NormalCancelBtn.vue';
import type { NormalOkBtnProps } from './components/NormalOkBtn.vue';

export type ModalContextProps = NormalCancelBtnProps & NormalOkBtnProps & ConfirmOkBtnProps & ConfirmCancelBtnProps;

import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';

const ModalContext: InjectionKey<Reactive<ModalContextProps>> = Symbol('ModalContext');

export const useModalContextInject = () => {
  return inject(ModalContext, reactive({} as ModalContextProps));
};

export const useModalContextProvider = (props: Reactive<ModalContextProps>) => {
  return provide(ModalContext, props);
};

export const ModalContextProvider = defineComponent({
  props: {
    value: {
      type: Object as PropType<ModalContextProps>,
    },
  },
  setup(props, { slots }) {
    useModalContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
