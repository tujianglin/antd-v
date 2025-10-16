<script lang="tsx" setup>
import type { Color } from '@/vc-component/color-picker';
import RcColorPicker from '@/vc-component/color-picker';
import { computed, ref, toRefs, watch } from 'vue';
import Segmented from '../../../segmented/index.vue';
import { AggregationColor } from '../../color';
import { usePanelPickerContextInject, type PanelPickerContextProps } from '../../context';
import { genAlphaColor, generateColor } from '../../util';
import ColorClear from '../ColorClear.vue';
import ColorInput from '../ColorInput.vue';
import ColorSlider from '../ColorSlider.vue';
import GradientColorBar from './GradientColorBar.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const components = {
  slider: ColorSlider,
};

type Info = {
  type?: 'hue' | 'alpha';
  value?: number;
};

const panelPickerContext = usePanelPickerContextInject() as PanelPickerContextProps;

const {
  mode,
  modeOptions,
  prefixCls,
  allowClear,
  value,
  disabledAlpha,
  onChange,
  onClear,
  onChangeComplete,
  activeIndex,
  gradientDragging,
} = toRefs(panelPickerContext);

// ============================ Colors ============================
const colors = computed(() => {
  if (!value?.value?.cleared) {
    return value?.value?.getColors();
  }

  return [
    {
      percent: 0,
      color: new AggregationColor(''),
    },
    {
      percent: 100,
      color: new AggregationColor(''),
    },
  ];
});

// ========================= Single Color =========================
const isSingle = computed(() => !value?.value.isGradient());

// We cache the point color in case user drag the gradient point across another one
const lockedColor = ref<AggregationColor>(value?.value as AggregationColor);

// Use layout effect here since `useEffect` will cause a blink when mouseDown
watch(
  [gradientDragging, activeIndex],
  () => {
    if (!isSingle.value) {
      lockedColor.value = colors.value[activeIndex.value]?.color;
    }
  },
  { immediate: true, flush: 'post' },
);

const activeColor = computed(() => {
  if (isSingle.value) {
    return value?.value as AggregationColor;
  }

  // Use cache when dragging. User can not operation panel when dragging.
  if (gradientDragging.value) {
    return lockedColor.value as AggregationColor;
  }

  return colors.value[activeIndex.value]?.color as AggregationColor;
});

// ========================= Picker Color =========================
const pickerColor = ref<AggregationColor | null>(activeColor.value as AggregationColor);
const forceSync = ref(0);

const mergedPickerColor = computed(() =>
  pickerColor.value?.equals(activeColor.value as AggregationColor) ? activeColor.value : pickerColor.value,
);

watch(
  [forceSync, () => activeColor?.value?.toHexString()],
  () => {
    pickerColor.value = activeColor.value;
  },
  { immediate: true, deep: true, flush: 'post' },
);

// ============================ Change ============================
const fillColor = (nextColor: AggregationColor | Color, info?: Info) => {
  let submitColor = generateColor(nextColor);

  // Fill alpha color to 100% if origin is cleared color
  if (value.value.cleared) {
    const rgb = submitColor.toRgb();

    // Auto fill color if origin is `0/0/0` to enhance user experience
    if (!rgb.r && !rgb.g && !rgb.b && info) {
      const { type: infoType, value: infoValue = 0 } = info;

      submitColor = new AggregationColor({
        h: infoType === 'hue' ? infoValue : 0,
        s: 1,
        b: 1,
        a: infoType === 'alpha' ? infoValue / 100 : 1,
      });
    } else {
      submitColor = genAlphaColor(submitColor);
    }
  }

  if (mode.value === 'single') {
    return submitColor;
  }

  const nextColors = [...colors.value];
  nextColors[activeIndex.value] = {
    ...nextColors[activeIndex.value],
    color: submitColor,
  };

  return new AggregationColor(nextColors);
};

const onPickerChange = (colorValue: AggregationColor | Color, fromPicker: boolean, info?: Info) => {
  const nextColor = fillColor(colorValue, info);
  pickerColor.value = nextColor.isGradient() ? nextColor.getColors()[activeIndex.value].color : nextColor;
  onChange?.value?.(nextColor, fromPicker);
};

const onInternalChangeComplete = (nextColor: Color, info?: Info) => {
  // Trigger complete event
  onChangeComplete?.value?.(fillColor(nextColor, info));

  // Back of origin color in case in controlled
  // This will set after `onChangeComplete` to avoid `setState` trigger rerender
  // which will make `fillColor` get wrong `color.cleared` state
  forceSync.value = forceSync.value + 1;
};

const onInputChange = (colorValue: AggregationColor) => {
  onChange?.value?.(fillColor(colorValue));
};

const showMode = computed(() => modeOptions.value.length > 1);
</script>
<template>
  <div v-if="allowClear || showMode" :class="`${prefixCls}-operation`">
    <Segmented v-if="showMode" :options="modeOptions" v-model:value="mode" />
    <ColorClear
      :prefix-cls="prefixCls"
      :value="value"
      @change="
        (clearColor) => {
          onChange(clearColor);
          onClear?.();
        }
      "
    />
  </div>
  <GradientColorBar v-bind="panelPickerContext" :colors="colors" />
  <RcColorPicker
    :prefix-cls="prefixCls"
    :value="mergedPickerColor?.toHsb()"
    :disabled-alpha="disabledAlpha"
    @change="
      (colorValue, info) => {
        onPickerChange(colorValue, true, info);
      }
    "
    @change-complete="
      (colorValue, info) => {
        onInternalChangeComplete(colorValue, info);
      }
    "
    :components="components"
  />
  <ColorInput
    :value="activeColor"
    @change="onInputChange"
    :prefix-cls="prefixCls"
    :disabled-alpha="disabledAlpha"
    :format="panelPickerContext?.format"
    :disabled-format="panelPickerContext?.disabledFormat"
    @format-change="panelPickerContext?.onFormatChange"
  />
</template>
