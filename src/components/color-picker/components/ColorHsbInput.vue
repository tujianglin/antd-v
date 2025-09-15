<script lang="tsx" setup>
import type { HSB } from '@/vc-component/color-picker';
import { computed, ref } from 'vue';
import type { AggregationColor } from '../color';
import { generateColor, getRoundNumber } from '../util';
import ColorSteppers from './ColorSteppers.vue';

interface ColorHsbInputProps {
  prefixCls: string;
  value?: AggregationColor;
  onChange?: (value: AggregationColor) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, value, onChange } = defineProps<ColorHsbInputProps>();

const colorHsbInputPrefixCls = computed(() => `${prefixCls}-hsb-input`);
const internalValue = ref<AggregationColor>(generateColor(value || '#000'));

const hsbValue = computed(() => value || (internalValue.value as AggregationColor));

const handleHsbChange = (step: number, type: keyof HSB) => {
  const hsb = hsbValue.value.toHsb();
  hsb[type] = type === 'h' ? step : (step || 0) / 100;
  const genColor = generateColor(hsb);
  internalValue.value = genColor;

  onChange?.(genColor);
};
</script>

<template>
  <div :class="colorHsbInputPrefixCls">
    <ColorSteppers
      :max="360"
      :min="0"
      :value="Number(hsbValue.toHsb().h)"
      :prefix-cls="prefixCls"
      :class="colorHsbInputPrefixCls"
      :formatter="(step) => getRoundNumber(step as number || 0).toString()"
      @change="(step) => handleHsbChange(Number(step), 'h')"
    />
    <ColorSteppers
      :max="100"
      :min="0"
      :value="Number(hsbValue.toHsb().s * 100)"
      :prefix-cls="prefixCls"
      :class="colorHsbInputPrefixCls"
      :formatter="(step) => `${getRoundNumber(step as number || 0) }%`"
      @change="(step) => handleHsbChange(Number(step), 's')"
    />
    <ColorSteppers
      :max="100"
      :min="0"
      :value="Number(hsbValue.toHsb().b * 100)"
      :prefix-cls="prefixCls"
      :class="colorHsbInputPrefixCls"
      :formatter="(step) => `${getRoundNumber(step as number || 0) }%`"
      @change="(step) => handleHsbChange(Number(step), 'b')"
    />
  </div>
</template>
