<script lang="tsx" setup>
import type { BaseSliderProps } from '@/vc-component/color-picker';
import GradientColorSlider from './GradientColorSlider.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { value, onChange, onChangeComplete, ...props } = defineProps<BaseSliderProps>();

const singleOnChange = (v: number[]) => onChange(v[0]);
const singleOnChangeComplete = (v: number[]) => onChangeComplete(v[0]);
</script>
<template>
  <GradientColorSlider v-bind="props" :value="[value]" @change="singleOnChange" @change-complete="singleOnChangeComplete" />
</template>
