import { computed, defineComponent, inject, provide, ref, type InjectionKey, type Ref } from 'vue';

export const DisabledContext: InjectionKey<Ref<boolean>> = Symbol('DisabledContext');

export const useDisabledContextInject = () => {
  return inject(DisabledContext, ref(false));
};

export const useDisabledContextProvider = (props: Ref<boolean>) => {
  provide(DisabledContext, props);
};

export const DisabledContextProvider = defineComponent({
  props: { disabled: Boolean },
  setup(props, { slots }) {
    useDisabledContextProvider(computed(() => props.disabled));
    return () => <>{slots.default?.()}</>;
  },
});
