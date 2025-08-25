import { defineComponent, inject, provide, type InjectionKey, type PropType } from 'vue';

export type QueueCreate = (appendFunc: VoidFunction) => void;

const OrderContext: InjectionKey<QueueCreate> = Symbol('OrderContext');

export const useOrderContextInject = () => inject(OrderContext, null);

export const useOrderContextProvider = (queueCreate: QueueCreate) => {
  provide(OrderContext, queueCreate);
};

export const OrderContextProvider = defineComponent({
  props: {
    value: Function as PropType<QueueCreate>,
  },
  setup(props, { slots }) {
    useOrderContextProvider(props.value);
    return () => <>{slots.default?.()}</>;
  },
});
