import { computed, defineComponent, inject, ref, type InjectionKey, type Ref } from 'vue';

export const DisabledContext: InjectionKey<Ref<boolean>> = Symbol('DisabledContext');

export const useDisabledContextInject = () => {
  return inject(DisabledContext, ref(false));
};

export const useDisabledContextProvider = (props: Ref<boolean>) => {
  return inject(DisabledContext, props);
};

export const DisabledContextProvider = defineComponent({
  props: { value: Boolean },
  setup(props, { slots }) {
    useDisabledContextProvider(computed(() => props.value));
    return <>{slots.default?.()}</>;
  },
});
