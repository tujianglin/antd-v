<script lang="tsx" setup>
import { ref } from 'vue';
import ColorPicker from '../ColorPicker.vue';
import { Color } from '../color';
const value = ref(new Color('rgba(255,0,0,0)'));
</script>
<template>
  <ColorPicker v-model:value="value" />
  <div
    :style="{
      width: `${258}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: `${8}px`,
    }"
  >
    <span>hex: {{ value.toHexString() }}</span>
    <span>rgb: {{ value.toRgbString() }}</span>
    <span>hsb: {{ value.toHsbString() }}</span>
  </div>
</template>
