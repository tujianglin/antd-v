<script lang="tsx" setup>
import { TimePicker } from '@/components';
import dayjs from 'dayjs';

const format = 'HH:mm';
</script>
<template>
  <TimePicker :value="dayjs('12:08', format)" :format="format" />
</template>
