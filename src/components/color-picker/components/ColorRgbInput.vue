<script lang="tsx" setup>
import type { RGB } from '@/vc-component/color-picker';
import { computed, ref } from 'vue';
import type { AggregationColor } from '../color';
import { generateColor } from '../util';
import ColorSteppers from './ColorSteppers.vue';

interface ColorRgbInputProps {
  prefixCls: string;
  value?: AggregationColor;
  onChange?: (value: AggregationColor) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, value, onChange } = defineProps<ColorRgbInputProps>();
const colorRgbInputPrefixCls = computed(() => `${prefixCls}-rgb-input`);
const internalValue = ref<AggregationColor>(generateColor(value || '#000'));

const rgbValue = computed(() => value || (internalValue.value as AggregationColor));

const handleRgbChange = (step: number | null, type: keyof RGB) => {
  const rgb = rgbValue.value.toRgb();
  rgb[type] = step || 0;
  const genColor = generateColor(rgb);

  internalValue.value = genColor;

  onChange?.(genColor);
};
</script>
<template>
  <div :class="colorRgbInputPrefixCls">
    <ColorSteppers
      :max="255"
      :min="0"
      :value="Number(rgbValue.toRgb().r)"
      :prefix-cls="prefixCls"
      :class="colorRgbInputPrefixCls"
      @change="(step) => handleRgbChange(Number(step), 'r')"
    />
    <ColorSteppers
      :max="255"
      :min="0"
      :value="Number(rgbValue.toRgb().g)"
      :prefix-cls="prefixCls"
      :class="colorRgbInputPrefixCls"
      @change="(step) => handleRgbChange(Number(step), 'g')"
    />
    <ColorSteppers
      :max="255"
      :min="0"
      :value="Number(rgbValue.toRgb().b)"
      :prefix-cls="prefixCls"
      :class="colorRgbInputPrefixCls"
      @change="(step) => handleRgbChange(Number(step), 'b')"
    />
  </div>
</template>
