<script lang="tsx" setup>
import { Badge, Space, Switch } from '@/components';
import { ClockCircleOutlined } from '@ant-design/icons-vue';
import { h, ref } from 'vue';

const show = ref(true);
</script>
<template>
  <Space>
    <Switch v-model:checked="show" />
    <Badge :count="show ? 11 : 0" show-zero color="#faad14" />
    <Badge :count="show ? 25 : 0" />
    <Badge :count="show ? h(ClockCircleOutlined, { style: { color: '#f5222d' } }) : 0" />
    <Badge class="site-badge-count-109" :count="show ? 109 : 0" :style="{ backgroundColor: '#52c41a' }" />
  </Space>
</template>
