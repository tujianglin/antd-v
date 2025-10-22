<script lang="tsx" setup>
import { DatePicker, Space } from '@/components';
import { effect, ref } from 'vue';

const { RangePicker } = DatePicker;

const value = ref();

effect(() => {
  console.log(value.value);
});
</script>
<template>
  <Space orientation="vertical" :size="12">
    <RangePicker />
    <RangePicker show-time />
    <RangePicker picker="week" />
    <RangePicker picker="month" />
    <RangePicker picker="quarter" />
    <RangePicker
      picker="year"
      :id="{
        start: 'startInput',
        end: 'endInput',
      }"
      @focus="
        (_, info) => {
          console.log('Focus:', info.range);
        }
      "
      @blur="
        (_, info) => {
          console.log('Blur:', info.range);
        }
      "
    />
  </Space>
</template>
