<script lang="tsx" setup>
import { DatePicker, Space } from '@/components';
import { effect, ref } from 'vue';

const value = ref();
const onChange = (date, dateString) => {
  console.log(date, dateString);
};

effect(() => {
  console.log(value.value);
});
</script>
<template>
  <Space orientation="vertical">
    <DatePicker v-model:value="value" @change="onChange" />
    <DatePicker v-model:value="value" @change="onChange" picker="week" />
    <DatePicker v-model:value="value" @change="onChange" picker="month" />
    <DatePicker v-model:value="value" @change="onChange" picker="quarter" />
    <DatePicker v-model:value="value" @change="onChange" picker="year" />
  </Space>
</template>
