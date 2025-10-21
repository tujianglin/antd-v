<script lang="tsx" setup>
import type { TabsProps } from '@/components';
import { Radio, Space, Tabs } from '@/components';
import { ref } from 'vue';

const tabPlacement = ref<TabsProps['tabPlacement']>('start');
</script>
<template>
  <Space class="!mb-6">
    Tab placement:
    <Radio.Group
      v-model:value="tabPlacement"
      :options="[
        { label: 'top', value: 'top' },
        { label: 'start', value: 'start' },
        { label: 'bottom', value: 'bottom' },
        { label: 'end', value: 'end' },
      ]"
    />
  </Space>
  <Tabs
    :tab-placement="tabPlacement"
    :items="
      Array.from({ length: 3 }).map((_, i) => {
        const id = String(i + 1);
        return {
          label: `Tab ${id}`,
          key: id,
          children: `Content of Tab ${id}`,
        };
      })
    "
  />
</template>
