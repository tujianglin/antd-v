<script lang="tsx" setup>
import { computed, ref } from 'vue';
import ColorPicker from '../ColorPicker.vue';
import type { Color } from '../color';

const toHexFormat = (value?: string) => value?.replace(/[^0-9a-fA-F#]/g, '').slice(0, 9) || '';
const value = ref<Color | string>('#163cff');

const color = computed(() =>
  typeof value.value === 'string' ? value.value : value.value.a < 1 ? value.value.toHexString() : value.value.toHexString(),
);
</script>
<template>
  <ColorPicker v-model:value="value">
    <template #panelRender="panel">
      <component :is="panel" />
      <input
        :value="color"
        @change="
          (e: any) => {
            const originValue = e.target.value;
            value = toHexFormat(originValue)
          }
        "
      />
    </template>
  </ColorPicker>
</template>
