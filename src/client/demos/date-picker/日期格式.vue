<script lang="tsx" setup>
import { DatePicker, Space, type DatePickerProps } from '@/components';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;

const dateFormat = 'YYYY/MM/DD';
const weekFormat = 'MM/DD';
const monthFormat = 'YYYY/MM';

/** Manually entering any of the following formats will perform date parsing */
const dateFormatList = ['DD/MM/YYYY', 'DD/MM/YY', 'DD-MM-YYYY', 'DD-MM-YY'];

const customFormat: DatePickerProps['format'] = (value) => `custom format: ${value.format(dateFormat)}`;

const customWeekStartEndFormat: DatePickerProps['format'] = (value) =>
  `${dayjs(value).startOf('week').format(weekFormat)} ~ ${dayjs(value).endOf('week').format(weekFormat)}`;
</script>
<template>
  <Space orientation="vertical" :size="12">
    <DatePicker :value="dayjs('2015/01/01', dateFormat)" :format="dateFormat" />
    <DatePicker :value="dayjs('01/01/2015', dateFormatList[0])" :format="dateFormatList" />
    <DatePicker :value="dayjs('2015/01', monthFormat)" :format="monthFormat" picker="month" />
    <DatePicker :value="dayjs()" :format="customWeekStartEndFormat" picker="week" />
    <RangePicker :value="[dayjs('2015/01/01', dateFormat), dayjs('2015/01/01', dateFormat)]" :format="dateFormat" />
    <DatePicker :value="dayjs('2015/01/01', dateFormat)" :format="customFormat" />
  </Space>
</template>
