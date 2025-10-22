<script lang="tsx" setup>
import { DatePicker, Space } from '@/components';
</script>
<template>
  <Space orientation="vertical" class="!w-full">
    <DatePicker status="error" class="!w-full" />
    <DatePicker status="warning" class="!w-full" />
    <DatePicker.RangePicker status="error" class="!w-full" />
    <DatePicker.RangePicker status="warning" class="!w-full" />
  </Space>
</template>
