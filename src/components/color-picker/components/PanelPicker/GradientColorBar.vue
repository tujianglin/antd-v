<script lang="tsx" setup>
import type { UnstableContextProps } from '@/vc-component/slider/context';
import { computed, ref } from 'vue';
import type { GradientColor } from '../../color';
import { AggregationColor } from '../../color';
import type { PanelPickerContextProps } from '../../context';
import { getGradientPercentColor } from '../../util';
import GradientColorSlider from '../GradientColorSlider.vue';

export interface GradientColorBarProps extends PanelPickerContextProps {
  colors: GradientColor;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });
/**
 * GradientColorBar will auto show when the mode is `gradient`.
 */
const { prefixCls, mode, onChange, onChangeComplete, onActive, activeIndex, onGradientDragging, colors } =
  defineProps<GradientColorBarProps>();

function sortColors(colors: { percent: number; color: string }[]) {
  return [...colors].sort((a, b) => a.percent - b.percent);
}

const isGradient = computed(() => mode === 'gradient');

// ============================= Colors =============================
const colorList = computed(() =>
  colors.map((info) => ({
    percent: info.percent,
    color: info.color.toRgbString(),
  })),
);

const values = computed(() => colorList.value.map((info) => info.percent));

// ============================== Drag ==============================
const colorsRef = ref(colorList.value);

// Record current colors
const onDragStart: UnstableContextProps['onDragStart'] = ({ rawValues, draggingIndex, draggingValue }) => {
  if (rawValues.length > colorList.value.length) {
    // Add new node
    const newPointColor = getGradientPercentColor(colorList.value, draggingValue);
    const nextColors = [...colorList.value];
    nextColors.splice(draggingIndex, 0, {
      percent: draggingValue,
      color: newPointColor,
    });

    colorsRef.value = nextColors;
  } else {
    colorsRef.value = colorList.value;
  }

  onGradientDragging(true);
  onChange(new AggregationColor(sortColors(colorsRef.value)), true);
};

// Adjust color when dragging
const onDragChange: UnstableContextProps['onDragChange'] = ({ deleteIndex, draggingIndex, draggingValue }) => {
  let nextColors = [...colorsRef.value];

  if (deleteIndex !== -1) {
    nextColors.splice(deleteIndex, 1);
  } else {
    nextColors[draggingIndex] = {
      ...nextColors[draggingIndex],
      percent: draggingValue,
    };

    nextColors = sortColors(nextColors);
  }

  onChange(new AggregationColor(nextColors), true);
};

// ============================== Key ===============================
const onKeyDelete = (index: number) => {
  const nextColors = [...colorList.value];
  nextColors.splice(index, 1);

  const nextColor = new AggregationColor(nextColors);

  onChange(nextColor);
  onChangeComplete(nextColor);
};

// ============================= Change =============================
const onInternalChangeComplete = (nextValues: number[]) => {
  onChangeComplete(new AggregationColor(colorList.value));

  // Reset `activeIndex` if out of range
  if (activeIndex >= nextValues.length) {
    onActive(nextValues.length - 1);
  }

  onGradientDragging(false);
};
</script>
<template>
  <GradientColorSlider
    v-if="isGradient"
    :min="0"
    :max="100"
    :prefix-cls="prefixCls"
    :class="`${prefixCls}-gradient-slider`"
    :colors="colorList"
    :color="null"
    :value="values"
    range
    @change-complete="onInternalChangeComplete"
    :disabled="false"
    type="gradient"
    :active-index="activeIndex"
    @active="onActive"
    @drag-start="onDragStart"
    @drag-change="onDragChange"
    @key-delete="onKeyDelete"
  />
</template>
