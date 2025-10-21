<script lang="tsx" setup>
import type { TabsProps } from '@/components';
import { Tabs } from '@/components';
import { ref } from 'vue';

const onChange = (key: string) => {
  console.log(key);
};

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'Tab 1',
    children: 'Content of Tab Pane 1',
  },
  {
    key: '2',
    label: 'Tab 2',
    children: 'Content of Tab Pane 2',
    disabled: true,
  },
  {
    key: '3',
    label: 'Tab 3',
    children: 'Content of Tab Pane 3',
  },
];

const activeKey = ref('1');
</script>
<template>
  <Tabs :active-key="activeKey" :items="items" @change="onChange" />
</template>
