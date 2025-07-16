import { defineComponent, inject, type InjectionKey } from 'vue';

export const disabledProviderKey: InjectionKey<boolean> = Symbol('disabledProvider');

export const useDisabledContextInject = () => {
  return inject(disabledProviderKey, false);
};

export const useDisabledContextProvider = (props: boolean) => {
  return inject(disabledProviderKey, props);
};

export const DisabledContextProvider = defineComponent({
  props: {
    value: Boolean,
  },
  setup(props, { slots }) {
    useDisabledContextProvider(props.value);
    return <>{slots.default?.()}</>;
  },
});
