<script setup lang="tsx">
import { Slider, Switch } from '@/components';
import { ref } from 'vue';

const disabled = ref(false);
</script>

<template>
  <div>
    <Slider :value="30" :disabled="disabled" />
    <Slider :range="true" :value="[20, 50]" :disabled="disabled" />
    Disabled: <Switch size="small" v-model:value="disabled" />
  </div>
</template>
