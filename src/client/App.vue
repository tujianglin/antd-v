<script lang="tsx" setup>
import { ref } from 'vue';
import demo from './demo';

const direction = ref('ltr');

setTimeout(() => {
  direction.value = 'rtl';
}, 2000);
</script>
<template>
  <demo />
</template>
