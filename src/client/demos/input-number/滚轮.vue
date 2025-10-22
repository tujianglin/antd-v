<script lang="tsx" setup>
import { InputNumber } from '@/components';
import { effect, ref } from 'vue';

const value = ref(3);
effect(() => {
  console.log(value.value);
});
</script>
<template>
  <InputNumber :min="1" :max="10" v-model:value="value" change-on-wheel />
</template>
