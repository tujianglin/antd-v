<script lang="tsx" setup>
import { Space, TreeSelect } from '@/components';
</script>
<template>
  <Space vertical class="!w-full">
    <TreeSelect status="error" class="!w-full" placeholder="Error" />
    <TreeSelect status="warning" class="!w-full" multiple placeholder="Warning multiple" />
  </Space>
</template>
