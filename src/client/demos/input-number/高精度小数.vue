<script lang="tsx" setup>
import { InputNumber } from '@/components';
import { ref } from 'vue';
const value = ref(1);
</script>
<template>
  <InputNumber class="!w-50" v-model:value="value" :min="0" :max="10" step="0.00000000000001" string-mode />
</template>
