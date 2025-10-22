<script lang="tsx" setup>
import { Tooltip, Tree, type TreeDataNode } from '@/components';
import type { VueNode } from '@/vc-util/type';
const dig = (path = '0', level = 3) => {
  const list = [];
  for (let i = 0; i < 10; i += 1) {
    const key = `${path}-${i}`;
    const treeNode: TreeDataNode = {
      title: key,
      key,
    };

    if (level > 0) {
      treeNode.children = dig(key, level - 1);
    }

    list.push(treeNode);
  }
  return list;
};

const treeData = dig();

const MemoTooltip = Tooltip;

const titleRender = (item) => {
  const title = item.title as VueNode;
  return <MemoTooltip title={title}>{title}</MemoTooltip>;
};
</script>
<template>
  <Tree :height="233" default-expand-all :tree-data="treeData" :title-render="titleRender" />
</template>
