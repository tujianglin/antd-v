<script lang="tsx" setup>
import { Avatar, Space } from '@/components';
import { UserOutlined } from '@ant-design/icons-vue';
import { h } from 'vue';

const url = 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg';
</script>
<template>
  <Space :size="16" wrap>
    <Avatar :icon="UserOutlined" />
    <Avatar>U</Avatar>
    <Avatar :size="40">USER</Avatar>
    <Avatar :src="url" />
    <Avatar :src="h('img', { draggable: false, src: url, alt: 'avatar' })" />
    <Avatar :style="{ backgroundColor: '#fde3cf', color: '#f56a00' }">U</Avatar>
    <Avatar :style="{ backgroundColor: '#87d068' }" :icon="UserOutlined" />
  </Space>
</template>
