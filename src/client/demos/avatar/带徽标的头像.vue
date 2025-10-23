<script lang="tsx" setup>
import { Avatar, Badge, Space } from '@/components';
import { UserOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <Space :size="24">
    <Badge :count="1">
      <Avatar shape="square" :icon="UserOutlined" />
    </Badge>
    <Badge dot>
      <Avatar shape="square" :icon="UserOutlined" />
    </Badge>
  </Space>
</template>
