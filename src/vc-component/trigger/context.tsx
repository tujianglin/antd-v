import { defineComponent, inject, provide, type InjectionKey, type PropType } from 'vue';

export interface TriggerContextProps {
  registerSubPopup: (id: string, node: HTMLElement) => void;
}

const TriggerContext: InjectionKey<TriggerContextProps | null> = Symbol('TriggerContext');

export const useTriggerContextInject = () => {
  return inject(TriggerContext, null);
};

export const useTriggerContextProvider = (props: TriggerContextProps) => {
  provide(TriggerContext, props);
};

export const TriggerContextProvider = defineComponent({
  props: {
    value: Object as PropType<TriggerContextProps>,
  },
  setup(props, { slots }) {
    useTriggerContextProvider(props.value);
    return () => <>{slots.default?.()}</>;
  },
});
