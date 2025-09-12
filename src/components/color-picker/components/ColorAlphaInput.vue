<script lang="tsx" setup>
import { computed, ref } from 'vue';
import type { AggregationColor } from '../color';
import { generateColor, getColorAlpha } from '../util';
import ColorSteppers from './ColorSteppers.vue';

interface ColorAlphaInputProps {
  prefixCls: string;
  value?: AggregationColor;
  onChange?: (value: AggregationColor) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, value, onChange } = defineProps<ColorAlphaInputProps>();

const colorAlphaInputPrefixCls = computed(() => `${prefixCls}-alpha-input`);
const internalValue = ref<AggregationColor>(generateColor(value || '#000'));

const alphaValue = computed(() => value || (internalValue.value as AggregationColor));

const handleAlphaChange = (step: number | null) => {
  const hsba = alphaValue.value.toHsb();
  hsba.a = (step || 0) / 100;
  const genColor = generateColor(hsba);

  internalValue.value = genColor;

  onChange?.(genColor);
};
</script>
<template>
  <ColorSteppers
    :value="getColorAlpha(alphaValue)"
    :prefix-cls="prefixCls"
    :formatter="(step) => `${step}%`"
    :class="colorAlphaInputPrefixCls"
    @change="handleAlphaChange"
  />
</template>
