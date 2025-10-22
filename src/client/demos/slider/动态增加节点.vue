<script lang="tsx" setup>
import { Slider } from '@/components';
import { ref } from 'vue';

const value = ref([20, 80]);
</script>
<template>
  <Slider :range="{ editable: true, minCount: 1, maxCount: 5 }" v-model:value="value" />
</template>
