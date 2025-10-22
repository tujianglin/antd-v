<script lang="tsx" setup>
import { Tree, type TreeDataNode } from '@/components';
import type { DirectoryTreeProps } from '@/components/tree';
const treeData: TreeDataNode[] = [
  {
    title: 'parent 0',
    key: '0-0',
    children: [
      { title: 'leaf 0-0', key: '0-0-0', isLeaf: true },
      { title: 'leaf 0-1', key: '0-0-1', isLeaf: true },
    ],
  },
  {
    title: 'parent 1',
    key: '0-1',
    children: [
      { title: 'leaf 1-0', key: '0-1-0', isLeaf: true },
      { title: 'leaf 1-1', key: '0-1-1', isLeaf: true },
    ],
  },
];

const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
  console.log('Trigger Select', keys, info);
};

const onExpand: DirectoryTreeProps['onExpand'] = (keys, info) => {
  console.log('Trigger Expand', keys, info);
};
</script>
<template>
  <Tree.DirectoryTree multiple draggable default-expand-all @select="onSelect" @expand="onExpand" :tree-data="treeData" />
</template>
