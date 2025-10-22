<script lang="tsx" setup>
import { TreeSelect } from '@/components';
import { SmileOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

const icon = <SmileOutlined />;
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
            title: 'my leaf',
          },
          {
            value: 'leaf2',
            title: 'your leaf',
          },
        ],
      },
      {
        value: 'parent 1-1',
        title: 'parent 1-1',
        children: [
          {
            value: 'sss',
            title: <b style={{ color: '#08c' }}>sss</b>,
          },
        ],
      },
    ],
  },
];

const value = ref();
</script>
<template>
  <TreeSelect
    show-search
    :suffix-icon="icon"
    class="!w-full"
    v-model:value="value"
    :styles="{
      popup: {
        root: { maxHeight: `${400}px`, overflow: 'auto' },
      },
    }"
    placeholder="Please select"
    allow-clear
    tree-default-expand-all
    :tree-data="treeData"
  />
  <br />
  <br />
  <TreeSelect
    show-search
    prefix="Prefix"
    class="!w-full"
    v-model:value="value"
    :styles="{
      popup: {
        root: { maxHeight: `${400}px`, overflow: 'auto' },
      },
    }"
    placeholder="Please select"
    allow-clear
    tree-default-expand-all
    :tree-data="treeData"
  />
</template>
