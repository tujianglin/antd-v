<script lang="tsx" setup>
import { Input, Space } from '@/components';
import { ClockCircleOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <Space vertical class="!w-full">
    <Input status="error" placeholder="Error" />
    <Input status="warning" placeholder="Warning" />
    <Input status="error" :prefix="ClockCircleOutlined" placeholder="Error with prefix" />
    <Input status="warning" :prefix="ClockCircleOutlined" placeholder="Warning with prefix" />
  </Space>
</template>
