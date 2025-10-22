<script lang="tsx" setup>
import { DatePicker, Space, type DatePickerProps } from '@/components';

const onChange: DatePickerProps['onChange'] = (date, dateString) => {
  console.log(date, dateString);
};
</script>
<template>
  <Space orientation="vertical">
    <DatePicker
      :format="{
        format: 'YYYY-MM-DD',
        type: 'mask',
      }"
      @change="onChange"
    />
    <DatePicker
      :format="{
        format: 'YYYY-MM-DD HH:mm:ss',
        type: 'mask',
      }"
      @change="onChange"
    />
  </Space>
</template>
