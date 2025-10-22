<script lang="tsx" setup>
import { DatePicker, Space } from '@/components';

const { RangePicker } = DatePicker;

const onOk = (value) => {
  console.log('onOk: ', value);
};
</script>
<template>
  <Space orientation="vertical" :size="12">
    <DatePicker
      show-time
      @change="
        (value, dateString) => {
          console.log('Selected Time: ', value);
          console.log('Formatted Selected Time: ', dateString);
        }
      "
      @ok="onOk"
    />
    <RangePicker
      :show-time="{ format: 'HH:mm' }"
      format="YYYY-MM-DD HH:mm"
      @change="
        (value, dateString) => {
          console.log('Selected Time: ', value);
          console.log('Formatted Selected Time: ', dateString);
        }
      "
      @ok="onOk"
    />
  </Space>
</template>
