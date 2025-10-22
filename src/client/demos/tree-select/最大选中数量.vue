<script lang="tsx" setup>
import { TreeSelect } from '@/components';
import { DownOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

const MAX_COUNT = 3;

const treeData = [
  {
    title: 'Parent 1',
    value: 'parent1',
    children: [
      {
        title: 'Child 1-1',
        value: 'child1-1',
      },
      {
        title: 'Child 1-2',
        value: 'child1-2',
      },
    ],
  },
  {
    title: 'Parent 2',
    value: 'parent2',
    children: [
      {
        title: 'Child 2-1',
        value: 'child2-1',
      },
      {
        title: 'Child 2-2',
        value: 'child2-2',
      },
    ],
  },
];

const value = ref<string[]>(['child1-1']);

const suffix = () => (
  <>
    <span>
      {value.value.length} / {MAX_COUNT}
    </span>
    <DownOutlined />
  </>
);
</script>
<template>
  <TreeSelect
    :tree-data="treeData"
    v-model:value="value"
    multiple
    tree-default-expand-all
    :max-count="MAX_COUNT"
    class="!w-full"
    :suffix-icon="suffix"
    tree-checkable
    placeholder="Please select"
    :show-checked-strategy="TreeSelect.SHOW_CHILD"
  />
</template>
