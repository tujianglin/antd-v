<script lang="tsx" setup>
import { TimePicker, type TimePickerProps } from '@/components';
import dayjs from 'dayjs';

const onChange: TimePickerProps['onChange'] = (time, timeString) => {
  console.log(time, timeString);
};
</script>
<template>
  <TimePicker @change="onChange" :default-open-value="dayjs('00:00:00', 'HH:mm:ss')" />
</template>
