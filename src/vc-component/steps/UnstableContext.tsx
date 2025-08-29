import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';

export interface UnstableContextProps {
  /**
   * Used for Timeline component `reverse` prop.
   * Safe to remove if refactor.
   */
  railFollowPrevStatus?: boolean;
}

const UnstableContext: InjectionKey<Reactive<UnstableContextProps>> = Symbol('UnstableContext');

export const useUnstableContextInject = (): Reactive<UnstableContextProps> => {
  return inject(UnstableContext, reactive({}));
};

export const useUnstableContextProvider = (props: Reactive<UnstableContextProps>) => {
  provide(UnstableContext, props);
};

export const UnstableContextProvider = defineComponent({
  props: {
    value: Object as PropType<UnstableContextProps>,
  },
  setup(props, { slots }) {
    useUnstableContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
