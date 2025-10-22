<script lang="tsx" setup>
import type { DatePickerProps } from '@/components';
import { DatePicker, Space } from '@/components';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

const getYearMonth = (date: Dayjs) => date.year() * 12 + date.month();

// Disabled 7 days from the selected date
const disabled7DaysDate: DatePickerProps['disabledDate'] = (current, { from, type }) => {
  if (from) {
    const minDate = from.add(-6, 'days');
    const maxDate = from.add(6, 'days');

    switch (type) {
      case 'year':
        return current.year() < minDate.year() || current.year() > maxDate.year();

      case 'month':
        return getYearMonth(current) < getYearMonth(minDate) || getYearMonth(current) > getYearMonth(maxDate);

      default:
        return Math.abs(current.diff(from, 'days')) >= 7;
    }
  }

  return false;
};

// Disabled 6 months from the selected date
const disabled6MonthsDate: DatePickerProps['disabledDate'] = (current, { from, type }) => {
  if (from) {
    const minDate = from.add(-5, 'months');
    const maxDate = from.add(5, 'months');

    switch (type) {
      case 'year':
        return current.year() < minDate.year() || current.year() > maxDate.year();

      default:
        return getYearMonth(current) < getYearMonth(minDate) || getYearMonth(current) > getYearMonth(maxDate);
    }
  }

  return false;
};
</script>
<template>
  <Space direction="vertical">
    <RangePicker :disabled-date="disabled7DaysDate" />

    <RangePicker :disabled-date="disabled6MonthsDate" picker="month" />
  </Space>
</template>
