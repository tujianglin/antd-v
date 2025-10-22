<script lang="tsx" setup>
import { Space, TimePicker } from '@/components';
</script>
<template>
  <Space vertical>
    <TimePicker status="error" />
    <TimePicker status="warning" />
    <TimePicker.RangePicker status="error" />
    <TimePicker.RangePicker status="warning" />
  </Space>
</template>
