<script lang="tsx" setup>
import { Segmented } from '@/components';
import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <Segmented
    orientation="vertical"
    :options="[
      { value: 'List', icon: BarsOutlined },
      { value: 'Kanban', icon: AppstoreOutlined },
    ]"
  />
</template>
