<script lang="tsx" setup>
import { ColorPicker, Space } from '@/components';

const DEFAULT_COLOR = [
  {
    color: 'rgb(16, 142, 233)',
    percent: 0,
  },
  {
    color: 'rgb(135, 208, 104)',
    percent: 100,
  },
];
</script>
<template>
  <Space vertical>
    <ColorPicker
      :value="DEFAULT_COLOR"
      allow-clear
      show-text
      :mode="['single', 'gradient']"
      @change-complete="
        (color) => {
          console.log(color.toCssString());
        }
      "
    />
    <ColorPicker
      :value="DEFAULT_COLOR"
      allow-clear
      show-text
      mode="gradient"
      @change-complete="
        (color) => {
          console.log(color.toCssString());
        }
      "
    />
  </Space>
</template>
