<script lang="tsx" setup>
import { Avatar, Space } from '@/components';
import { UserOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <Space vertical :size="16">
    <Space wrap :size="16">
      <Avatar :size="64" :icon="UserOutlined" />
      <Avatar size="large" :icon="UserOutlined" />
      <Avatar :icon="UserOutlined" />
      <Avatar size="small" :icon="UserOutlined" />
      <Avatar :size="14" :icon="UserOutlined" />
    </Space>
    <Space wrap :size="16">
      <Avatar shape="square" :size="64" :icon="UserOutlined" />
      <Avatar shape="square" size="large" :icon="UserOutlined" />
      <Avatar shape="square" :icon="UserOutlined" />
      <Avatar shape="square" size="small" :icon="UserOutlined" />
      <Avatar shape="square" :size="14" :icon="UserOutlined" />
    </Space>
  </Space>
</template>
