import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, ref, type InjectionKey, type PropType, type Reactive, type Ref } from 'vue';

export interface WatermarkContextProps {
  add: (ele: HTMLElement) => void;
  remove: (ele: HTMLElement) => void;
}

function voidFunc() {}

const WatermarkContext: InjectionKey<Reactive<WatermarkContextProps>> = Symbol('WatermarkContext');

export const useWatermarkContextInject = () => {
  return inject(
    WatermarkContext,
    reactive({
      add: voidFunc,
      remove: voidFunc,
    }),
  );
};

export const useWatermarkContextProvider = (props: Reactive<WatermarkContextProps>) => {
  return provide(WatermarkContext, props);
};

export const WatermarkContextProvider = defineComponent({
  props: {
    value: {
      type: Object as PropType<WatermarkContextProps>,
    },
  },
  setup(props, { slots }) {
    useWatermarkContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});

export function usePanelRef(panelSelector?: Ref<string>) {
  const watermark = useWatermarkContextInject();

  const panelEleRef = ref<HTMLElement>(null);
  const panelRef = (ele: HTMLElement | null) => {
    if (ele) {
      const innerContentEle = panelSelector?.value ? ele.querySelector<HTMLElement>(panelSelector.value)! : ele;
      watermark.add(innerContentEle);
      panelEleRef.value = innerContentEle;
    } else {
      watermark.remove(panelEleRef.value!);
    }
  };

  return panelRef;
}
