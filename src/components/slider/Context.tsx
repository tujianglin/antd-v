import type { SliderProps as RcSliderProps } from '@/vc-component/slider';
import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { DirectionType } from '../config-provider';

export interface SliderInternalContextProps {
  handleRender?: RcSliderProps['handleRender'];
  direction?: DirectionType;
}

/** @private Internal context. Do not use in your production. */
const SliderInternalContext: InjectionKey<Reactive<SliderInternalContextProps>> = Symbol('SliderInternalContext');

export const useSliderInternalContextInject = () => {
  return inject(SliderInternalContext, reactive<Partial<SliderInternalContextProps>>({}));
};

export const useSliderInternalContextProvider = (props: Reactive<SliderInternalContextProps>) => {
  provide(SliderInternalContext, props);
};

export const SliderInternalContextProvider = defineComponent({
  props: {
    value: Object as PropType<SliderInternalContextProps>,
  },
  setup(props, { slots }) {
    useSliderInternalContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
