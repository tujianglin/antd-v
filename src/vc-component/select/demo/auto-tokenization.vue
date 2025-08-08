<script lang="tsx" setup>
import Select from '../Select.vue';
</script>
<template>
  <h2>自动分词</h2>
  <Select
    mode="tags"
    :max-count="3"
    style="width: 100%"
    :token-separators="[',']"
    :options="Array.from({ length: 20 }, (_, i) => ({ label: i.toString(), value: i.toString() }))"
  />
</template>
