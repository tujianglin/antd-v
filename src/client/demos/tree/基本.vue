<script lang="tsx" setup>
import { Tree, type TreeDataNode, type TreeProps } from '@/components';
import { ref } from 'vue';

const treeData: TreeDataNode[] = [
  {
    title: 'parent 1',
    key: '0-0',
    children: [
      {
        title: 'parent 1-0',
        key: '0-0-0',
        disabled: true,
        children: [
          {
            title: 'leaf',
            key: '0-0-0-0',
            disableCheckbox: true,
          },
          {
            title: 'leaf',
            key: '0-0-0-1',
          },
        ],
      },
      {
        title: 'parent 1-1',
        key: '0-0-1',
        children: [{ title: <span style={{ color: '#1677ff' }}>sss</span>, key: '0-0-1-0' }],
      },
    ],
  },
];

const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
  console.log('selected', selectedKeys, info);
};

const onCheck: TreeProps['onCheck'] = (checkedKeys, info) => {
  console.log('onCheck', checkedKeys, info);
};

const expandedKeys = ref(['0-0-0', '0-0-1']);
const selectedKeys = ref(['0-0-1']);
const checkedKeys = ref(['0-0-0', '0-0-1']);
</script>
<template>
  <Tree
    checkable
    v-model:expanded-keys="expandedKeys"
    v-model:selected-keys="selectedKeys"
    v-model:checked-keys="checkedKeys"
    @select="onSelect"
    @check="onCheck"
    :tree-data="treeData"
  />
</template>
