<script lang="tsx" setup>
import { Slider, type SliderSingleProps } from '@/components';
import { type CSSProperties } from 'vue';
const style: CSSProperties = {
  display: 'inline-block',
  height: `${300}px`,
  marginInlineStart: `${70}px`,
};

const marks: SliderSingleProps['marks'] = {
  0: '0°C',
  26: '26°C',
  37: '37°C',
  100: {
    style: { color: '#f50' },
    label: <strong>100°C</strong>,
  },
};
</script>
<template>
  <div :style="style">
    <Slider vertical :value="30" />
  </div>
  <div :style="style">
    <Slider vertical range :step="10" :value="[20, 50]" />
  </div>
  <div :style="style">
    <Slider vertical range :marks="marks" :value="[26, 37]" />
  </div>
</template>
