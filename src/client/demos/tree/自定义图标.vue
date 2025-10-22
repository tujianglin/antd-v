<script lang="tsx" setup>
import { Tree, type TreeDataNode } from '@/components';
import { DownOutlined, FrownFilled, FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons-vue';
import { h } from 'vue';
const treeData: TreeDataNode[] = [
  {
    title: 'parent 1',
    key: '0-0',
    icon: <SmileOutlined />,
    children: [
      {
        title: 'leaf',
        key: '0-0-0',
        icon: <MehOutlined />,
      },
      {
        title: 'leaf',
        key: '0-0-1',
        icon: ({ selected }) => (selected ? <FrownFilled /> : <FrownOutlined />),
      },
    ],
  },
];
</script>
<template>
  <Tree show-icon default-expand-all :selected-keys="['0-0-0']" :switcher-icon="() => h(DownOutlined)" :tree-data="treeData" />
</template>
