<script lang="tsx" setup>
import { Card, Space } from '@/components';
import { h } from 'vue';
</script>
<template>
  <Space vertical :size="16">
    <Card title="Default size card" :extra="h('a', { href: '#' }, 'More')" class="!w-[300px]">
      <p>Card content</p>
      <p>Card content</p>
      <p>Card content</p>
    </Card>
    <Card size="small" title="Small size card" :extra="h('a', { href: '#' }, 'More')" class="!w-[300px]">
      <p>Card content</p>
      <p>Card content</p>
      <p>Card content</p>
    </Card>
  </Space>
</template>
