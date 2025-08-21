<script lang="tsx" setup>
import Slider from '../Slider.vue';

const marks = {
  '-10': '-10°C',
  0: <strong>0°C</strong>,
  26: '26°C',
  37: '37°C',
  50: '50°C',
  100: {
    style: {
      color: 'red',
    },
    label: <strong>100°C</strong>,
  },
};
</script>
<template>
  <Slider />
  <br />
  <Slider :start-point="50" />
  <br />
  <Slider reverse :min="20" :max="60" />
  <br />
  <Slider :step="20" :value="50" />
  <br />
  <Slider dots :step="20" :value="100" />
  <br />
  <Slider dots :step="20" :value="100" :dot-style="{ borderColor: 'orange' }" :active-dot-style="{ borderColor: 'yellow' }" />
  <br />
  <Slider range :allow-cross="false" :value="[0, 20]" />
  <br />
  <div :style="{ height: '200px' }">
    <Slider
      vertical
      :min="-10"
      :marks="marks"
      :step="null"
      :value="20"
      @change-complete="(v) => console.log('AfterChange:', v)"
    />
  </div>
</template>
