import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { AriaValueFormat, Direction, SliderClassNames, SliderStyles } from './interface';

export interface SliderContextProps {
  min: number;
  max: number;
  includedStart: number;
  includedEnd: number;
  direction: Direction;
  disabled?: boolean;
  keyboard?: boolean;
  included?: boolean;
  step: number | null;
  range?: boolean;
  tabindex: number | number[];
  ariaLabelForHandle?: string | string[];
  ariaLabelledByForHandle?: string | string[];
  ariaRequired?: boolean;
  ariaValueTextFormatterForHandle?: AriaValueFormat | AriaValueFormat[];
  classNames: SliderClassNames;
  styles: SliderStyles;
}

const SliderContext: InjectionKey<Reactive<SliderContextProps>> = Symbol('SliderContext');

export const useSliderContextInject = () => {
  return inject(
    SliderContext,
    reactive<SliderContextProps>({
      min: 0,
      max: 0,
      direction: 'ltr',
      step: 1,
      includedStart: 0,
      includedEnd: 0,
      tabindex: 0,
      keyboard: true,
      styles: {},
      classNames: {},
    }),
  );
};

export const useSliderContextProvider = (props: Reactive<SliderContextProps>) => {
  provide(SliderContext, props);
};

export const SliderContextProvider = defineComponent({
  props: {
    value: Object as PropType<SliderContextProps>,
  },
  setup(props, { slots }) {
    useSliderContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});

export interface UnstableContextProps {
  onDragStart?: (info: { rawValues: number[]; draggingIndex: number; draggingValue: number }) => void;
  onDragChange?: (info: { rawValues: number[]; deleteIndex: number; draggingIndex: number; draggingValue: number }) => void;
}

const UnstableContext: InjectionKey<Reactive<UnstableContextProps>> = Symbol('UnstableContext');

export const useUnstableContextInject = () => {
  return inject(UnstableContext, reactive<UnstableContextProps>({}));
};

export const useUnstableContextProvider = (props: Reactive<UnstableContextProps>) => {
  provide(UnstableContext, props);
};

/** @private NOT PROMISE AVAILABLE. DO NOT USE IN PRODUCTION. */
export const UnstableContextProvider = defineComponent({
  props: {
    value: Object as PropType<UnstableContextProps>,
  },
  setup(props, { slots }) {
    useUnstableContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
