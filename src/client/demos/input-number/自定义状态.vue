<script lang="tsx" setup>
import { InputNumber, Space } from '@/components';
import { ClockCircleOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <Space orientation="vertical" class="!w-full">
    <InputNumber status="error" class="!w-full" />
    <InputNumber status="warning" class="!w-full" />
    <InputNumber status="error" class="!w-full" :prefix="ClockCircleOutlined" />
    <InputNumber status="warning" class="!w-full" :prefix="ClockCircleOutlined" />
  </Space>
</template>
