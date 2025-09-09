import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { AntAnchor } from './Anchor.vue';

const AnchorContext: InjectionKey<Reactive<AntAnchor>> = Symbol('AnchorContext');

export const useAnchorContextInject = () => {
  return inject(AnchorContext, reactive<Partial<AntAnchor>>({}));
};

export const useAnchorContextProvider = (props: Reactive<AntAnchor>) => {
  provide(AnchorContext, props);
};

export const AnchorContextProvider = defineComponent({
  props: {
    value: Object as PropType<AntAnchor>,
  },
  setup(props, { slots }) {
    useAnchorContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
