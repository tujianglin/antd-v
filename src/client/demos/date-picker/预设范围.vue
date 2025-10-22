<script lang="tsx" setup>
import type { TimeRangePickerProps } from '@/components';
import { DatePicker, Space } from '@/components';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { h } from 'vue';

const { RangePicker } = DatePicker;

const onChange = (date: Dayjs | Dayjs[]) => {
  if (date) {
    console.log('Date: ', date);
  } else {
    console.log('Clear');
  }
};
const onRangeChange = (dates: null | (Dayjs | null)[], dateStrings: string[]) => {
  if (dates) {
    console.log('From: ', dates[0], ', to: ', dates[1]);
    console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
  } else {
    console.log('Clear');
  }
};

const rangePresets: TimeRangePickerProps['presets'] = [
  { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
];
</script>
<template>
  <Space orientation="vertical" :size="12">
    <DatePicker
      :presets="[
        { label: 'Yesterday', value: dayjs().add(-1, 'd') },
        { label: 'Last Week', value: dayjs().add(-7, 'd') },
        { label: 'Last Month', value: dayjs().add(-1, 'month') },
      ]"
      @change="onChange"
    />
    <RangePicker :presets="rangePresets" @change="onRangeChange" />
    <RangePicker
      :presets="[
        {
          label: h('span', { 'aria-label': 'Current Time to End of Day' }, 'Now ~ EOD'),
          value: () => [dayjs(), dayjs().endOf('day')], // 5.8.0+ support function
        },
        ...rangePresets,
      ]"
      show-time
      format="YYYY/MM/DD HH:mm:ss"
      @change="onRangeChange"
    />
  </Space>
</template>
