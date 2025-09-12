import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { AggregationColor } from './color';
import type { ModeOptions } from './hooks/useModeColor';
import type { ColorFormatType, ColorPickerProps, ModeType, PresetsItem } from './interface';

export interface PanelPickerContextProps {
  prefixCls: string;
  allowClear?: boolean;
  disabled?: boolean;
  disabledAlpha?: boolean;
  mode: ModeType;
  onModeChange: (mode: ModeType) => void;
  modeOptions: ModeOptions;

  value: AggregationColor;
  onChange: (value?: AggregationColor, pickColor?: boolean) => void;
  onChangeComplete: ColorPickerProps['onChangeComplete'];

  format?: ColorFormatType;
  onFormatChange?: ColorPickerProps['onFormatChange'];

  /** The gradient Slider active handle */
  activeIndex: number;
  /** The gradient Slider handle active changed */
  onActive: (index: number) => void;
  /** Is gradient Slider dragging */
  gradientDragging: boolean;
  /** The gradient Slider dragging changed */
  onGradientDragging: (dragging: boolean) => void;

  onClear?: () => void;
  disabledFormat?: boolean;
}

export interface PanelPresetsContextProps {
  prefixCls: string;
  presets?: PresetsItem[];
  disabled?: boolean;
  value: AggregationColor;
  onChange?: (value: AggregationColor) => void;
}

const PanelPickerContext: InjectionKey<Reactive<PanelPickerContextProps>> = Symbol('PanelPickerContext');

export const usePanelPickerContextInject = () => {
  return inject(PanelPickerContext, reactive({} as PanelPickerContextProps));
};

export const usePanelPickerContextProvider = (props: Reactive<PanelPickerContextProps>) => {
  provide(PanelPickerContext, props);
};

export const PanelPickerContextProvider = defineComponent({
  props: {
    value: Object as PropType<PanelPickerContextProps>,
  },
  setup(props, { slots }) {
    usePanelPickerContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});

const PanelPresetsContext: InjectionKey<Reactive<PanelPresetsContextProps>> = Symbol('PanelPresetsContext');

export const usePanelPresetsContextInject = () => {
  return inject(PanelPresetsContext, reactive({} as PanelPresetsContextProps));
};

export const usePanelPresetsContextProvider = (props: Reactive<PanelPresetsContextProps>) => {
  provide(PanelPresetsContext, props);
};

export const PanelPresetsContextProvider = defineComponent({
  props: {
    value: Object as PropType<PanelPresetsContextProps>,
  },
  setup(props, { slots }) {
    usePanelPresetsContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
