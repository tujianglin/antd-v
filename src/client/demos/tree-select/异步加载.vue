<script lang="tsx" setup>
import { TreeSelect, type TreeSelectProps } from '@/components';
import { ref } from 'vue';

const value = ref<string>();
const treeData = ref<Omit<TreeSelectProps['treeData'][number], 'label'>[]>([
  { id: 1, pId: 0, value: '1', title: 'Expand to load' },
  { id: 2, pId: 0, value: '2', title: 'Expand to load' },
  { id: 3, pId: 0, value: '3', title: 'Tree Node', isLeaf: true },
]);

const genTreeNode = (parentId: number, isLeaf = false) => {
  const random = Math.random().toString(36).substring(2, 6);
  return {
    id: random,
    pId: parentId,
    value: random,
    title: isLeaf ? 'Tree Node' : 'Expand to load',
    isLeaf,
  };
};

const onLoadData: TreeSelectProps['loadData'] = ({ id }) =>
  new Promise((resolve) => {
    setTimeout(() => {
      treeData.value = treeData.value.concat([genTreeNode(id, false), genTreeNode(id, true), genTreeNode(id, true)]);
      resolve(undefined);
    }, 300);
  });
</script>
<template>
  <TreeSelect
    tree-data-simple-mode
    :style="{ width: `100%` }"
    v-model:value="value"
    :styles="{
      popup: {
        root: { maxHeight: '400px', overflow: 'auto' },
      },
    }"
    placeholder="Please select"
    tree-default-expand-all
    :load-data="onLoadData"
    :tree-data="treeData"
  />
</template>
