<script lang="tsx" setup>
import { Tree } from '@/components';
import { ref } from 'vue';

interface DataNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  children?: DataNode[];
}

const initTreeData: DataNode[] = [
  { title: 'Expand to load', key: '0' },
  { title: 'Expand to load', key: '1' },
  { title: 'Tree Node', key: '2', isLeaf: true },
];

// It's just a simple demo. You can use tree map to optimize update perf.
const updateTreeData = (list: DataNode[], key, children: DataNode[]): DataNode[] =>
  list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }
    return node;
  });

const treeData = ref(initTreeData);

const onLoadData = ({ key, children }: any) =>
  new Promise<void>((resolve) => {
    if (children) {
      resolve();
      return;
    }
    setTimeout(() => {
      treeData.value = updateTreeData(treeData.value, key, [
        { title: 'Child Node', key: `${key}-0` },
        { title: 'Child Node', key: `${key}-1` },
      ]);
      resolve();
    }, 1000);
  });
</script>
<template>
  <Tree :load-data="onLoadData" :tree-data="treeData" />
</template>
