<script lang="tsx" setup>
import { ref } from 'vue';
import { Circle } from '../vc-component/progress';
const percent = ref();
const restart = () => {
  percent.value = parseInt((Math.random() * 100).toString(), 10);
};
</script>
<template>
  <div :style="{ margin: `${10}px`, width: `${200}px` }">
    <Circle gap-position="top" :stroke-width="6" stroke-linecap="square" :percent="percent" />
    <button type="button" @click="restart">Restart</button>
  </div>
</template>
