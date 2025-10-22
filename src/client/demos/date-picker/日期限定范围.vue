<script lang="tsx" setup>
import { DatePicker } from '@/components';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const dateFormat = 'YYYY-MM-DD';
</script>
<template>
  <DatePicker
    :value="dayjs('2019-09-03', dateFormat)"
    :min-date="dayjs('2019-08-01', dateFormat)"
    :max-date="dayjs('2020-10-31', dateFormat)"
  />
</template>
