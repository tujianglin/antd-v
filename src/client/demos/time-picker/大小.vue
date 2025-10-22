<script lang="tsx" setup>
import { Space, TimePicker } from '@/components';
import dayjs from 'dayjs';
</script>
<template>
  <Space wrap>
    <TimePicker :value="dayjs('12:08:23', 'HH:mm:ss')" size="large" />
    <TimePicker :value="dayjs('12:08:23', 'HH:mm:ss')" />
    <TimePicker :value="dayjs('12:08:23', 'HH:mm:ss')" size="small" />
  </Space>
</template>
