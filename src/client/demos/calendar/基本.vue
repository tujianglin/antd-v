<script lang="tsx" setup>
import { Calendar, type CalendarProps } from '@/components';
import type { Dayjs } from 'dayjs';

const onPanelChange = (value: Dayjs, mode: CalendarProps['mode']) => {
  console.log(value.format('YYYY-MM-DD'), mode);
};
</script>
<template>
  <Calendar @panel-change="onPanelChange" />
</template>
