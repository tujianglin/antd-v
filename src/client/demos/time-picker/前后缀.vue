<script lang="tsx" setup>
import { Space, TimePicker } from '@/components';
import { SmileOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
</script>
<template>
  <Space vertical :size="12">
    <TimePicker :suffix-icon="SmileOutlined" :value="dayjs('00:00:00', 'HH:mm:ss')" />
    <TimePicker :prefix="SmileOutlined" />
    <TimePicker.RangePicker :prefix="SmileOutlined" />
  </Space>
</template>
