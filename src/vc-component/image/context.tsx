import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { OnGroupPreview, RegisterImage } from './interface';

export interface PreviewGroupContextProps {
  register?: RegisterImage;
  onPreview?: OnGroupPreview;
}

const PreviewGroupContext: InjectionKey<Reactive<PreviewGroupContextProps>> = Symbol('PreviewGroupContext');

export const usePreviewGroupContextInject = (): Reactive<PreviewGroupContextProps> => {
  return inject(PreviewGroupContext, reactive({}));
};

export const usePreviewGroupContextProvider = (props: Reactive<PreviewGroupContextProps>) => {
  provide(PreviewGroupContext, props);
};

export const PreviewGroupContextProvider = defineComponent({
  props: {
    value: Object as PropType<PreviewGroupContextProps>,
  },
  setup(props, { slots }) {
    usePreviewGroupContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
