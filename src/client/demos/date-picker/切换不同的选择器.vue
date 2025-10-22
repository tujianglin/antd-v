<script lang="tsx" setup>
import { DatePicker, Select, Space, TimePicker } from '@/components';
import { ref } from 'vue';

const type = ref('time');

const PickerWithType = ({ type, onChange }: { type; onChange }) => {
  if (type === 'time') return <TimePicker onChange={onChange} />;
  if (type === 'date') return <DatePicker onChange={onChange} />;
  return <DatePicker picker={type} onChange={onChange} />;
};
</script>
<template>
  <Space>
    <Select
      aria-label="Picker Type"
      v-model:value="type"
      :options="[
        { value: 'time', label: 'Time' },
        { value: 'date', label: 'Date' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'quarter', label: 'Quarter' },
        { value: 'year', label: 'Year' },
      ]"
    />
    <PickerWithType :type="type" @change="(value) => console.log(value)" />
  </Space>
</template>
