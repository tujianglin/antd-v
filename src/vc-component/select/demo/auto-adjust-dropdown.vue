<script lang="tsx" setup>
import { ref } from 'vue';
import Select, { Option } from '..';

const value = ref('1');
const onChange = (value) => {
  console.log(value);
};

setTimeout(() => {
  value.value = '2';
}, 2000);
</script>
<template>
  <Select @change="onChange" :popup-match-select-width="500" v-model:value="value">
    <Option value="1">Jack Jack Jack Jack Jack Jack Jack Jack Jack Jack Jack</Option>
    <Option value="2">Lucy Lucy Lucy Lucy Lucy Lucy Lucy Lucy Lucy Lucy</Option>
    <Option value="3">Jill</Option>
  </Select>
</template>
