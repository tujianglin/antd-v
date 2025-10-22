<script lang="tsx" setup>
import { TreeSelect } from '@/components';
import { ref } from 'vue';
const treeData = [
  {
    value: 'parent 1',
    title: 'parent 1',
    children: [
      {
        value: 'parent 1-0',
        title: 'parent 1-0',
        children: [
          {
            value: 'leaf1',
            title: 'leaf1',
          },
          {
            value: 'leaf2',
            title: 'leaf2',
          },
          {
            value: 'leaf3',
            title: 'leaf3',
          },
          {
            value: 'leaf4',
            title: 'leaf4',
          },
          {
            value: 'leaf5',
            title: 'leaf5',
          },
          {
            value: 'leaf6',
            title: 'leaf6',
          },
        ],
      },
      {
        value: 'parent 1-1',
        title: 'parent 1-1',
        children: [
          {
            value: 'leaf11',
            title: <b style={{ color: '#08c' }}>leaf11</b>,
          },
        ],
      },
    ],
  },
];

const value = ref<string>();
</script>
<template>
  <TreeSelect
    show-search
    class="!w-full"
    v-model:value="value"
    :styles="{
      popup: {
        root: { maxHeight: '400px', overflow: 'auto' },
      },
    }"
    placeholder="Please select"
    allow-clear
    multiple
    tree-default-expand-all
    :tree-data="treeData"
  />
</template>
