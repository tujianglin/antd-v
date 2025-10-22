<script lang="tsx" setup>
import { ColorPicker } from '@/components';
import { effect, ref } from 'vue';

const value = ref('#1577ff');

effect(() => {
  console.log(value.value);
});
</script>
<template>
  <ColorPicker v-model:value="value" format="hex" />
</template>
