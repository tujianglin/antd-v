<script lang="tsx" setup>
import { DatePicker, Space } from '@/components';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;

const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};

const disabledDate = (current) => {
  // Can not select days before today and today
  return current && current < dayjs().endOf('day');
};

const disabledDateForMonth = (current) => {
  // Can not select months before this month
  return current && current < dayjs().startOf('month');
};

const disabledDateTime = () => ({
  disabledHours: () => range(0, 24).splice(4, 20),
  disabledMinutes: () => range(30, 60),
  disabledSeconds: () => [55, 56],
});

const disabledRangeTime = (_, type) => {
  if (type === 'start') {
    return {
      disabledHours: () => range(0, 60).splice(4, 20),
      disabledMinutes: () => range(30, 60),
      disabledSeconds: () => [55, 56],
    };
  }
  return {
    disabledHours: () => range(0, 60).splice(20, 4),
    disabledMinutes: () => range(0, 31),
    disabledSeconds: () => [55, 56],
  };
};
</script>
<template>
  <Space orientation="vertical" :size="12">
    <DatePicker
      format="YYYY-MM-DD HH:mm:ss"
      :disabled-date="disabledDate"
      :disabled-time="disabledDateTime"
      :show-time="{ defaultOpenValue: dayjs('00:00:00', 'HH:mm:ss') }"
    />
    <DatePicker picker="month" :disabled-date="disabledDateForMonth" />
    <RangePicker :disabled-date="disabledDate" />
    <RangePicker
      :disabled-date="disabledDate"
      :disabled-time="disabledRangeTime"
      :show-time="{
        hideDisabledOptions: true,
        defaultOpenValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('11:59:59', 'HH:mm:ss')],
      }"
      format="YYYY-MM-DD HH:mm:ss"
    />
  </Space>
</template>
