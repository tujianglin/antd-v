<script lang="tsx" setup>
import { ref } from 'vue';
import Select from './select/index.vue';
const aa = ref('');
const options = ref(Array.from({ length: 20 }, (_, i) => ({ label: i.toString(), value: i.toString() })));
const value = ref(['1', '2']);
setTimeout(() => {
  // value.value = ['1', '2', '3'];
  // aa.value = '1';
  options.value = Array.from({ length: 22 }, (_, i) => ({ label: i.toString(), value: i.toString() }));
}, 1000);
</script>
<template>
  <Select
    mode="tags"
    :max-count="3"
    :value="value"
    style="width: 100%"
    :show-search="{ searchValue: aa }"
    :token-separators="[',']"
    :options="options"
  />
</template>
