<script lang="tsx" setup>
import { Slider, Switch } from '@/components';
import { ref } from 'vue';
const disabled = ref(false);
</script>
<template>
  <Slider :value="30" :disabled="disabled" />
  <Slider range :value="[20, 50]" :disabled="disabled" />
  Disabled: <Switch size="small" v-model:checked="disabled" />
</template>
