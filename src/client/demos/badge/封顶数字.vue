<script lang="tsx" setup>
import { Avatar, Badge, Space } from '@/components';
</script>
<template>
  <Space size="large">
    <Badge :count="99">
      <Avatar shape="square" size="large" />
    </Badge>
    <Badge :count="100">
      <Avatar shape="square" size="large" />
    </Badge>
    <Badge :count="99" :overflow-count="10">
      <Avatar shape="square" size="large" />
    </Badge>
    <Badge :count="1000" :overflow-count="999">
      <Avatar shape="square" size="large" />
    </Badge>
  </Space>
</template>
