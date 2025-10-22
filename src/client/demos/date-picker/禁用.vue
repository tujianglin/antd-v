<script lang="tsx" setup>
import { DatePicker, Space } from '@/components';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;

const dateFormat = 'YYYY-MM-DD';
</script>
<template>
  <Space orientation="vertical" :size="12">
    <DatePicker :value="dayjs('2015-06-06', dateFormat)" disabled />
    <DatePicker picker="month" :value="dayjs('2015-06', 'YYYY-MM')" disabled />
    <RangePicker :value="[dayjs('2015-06-06', dateFormat), dayjs('2015-06-06', dateFormat)]" disabled />
    <RangePicker :value="[dayjs('2019-09-03', dateFormat), dayjs('2019-11-22', dateFormat)]" :disabled="[false, true]" />
    <DatePicker
      :value="dayjs('2019-09-03', dateFormat)"
      :min-date="dayjs('2019-06-01', dateFormat)"
      :max-date="dayjs('2020-06-30', dateFormat)"
    />
  </Space>
</template>
