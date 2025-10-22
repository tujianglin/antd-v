<script lang="tsx" setup>
import { theme, Transfer, Tree, type TreeDataNode } from '@/components';
import type { TransferItem } from '@/components/transfer/index.vue';
import { ref } from 'vue';

// Customize Table Transfer
const isChecked = (selectedKeys, eventKey) => selectedKeys.includes(eventKey);

const generateTree = (treeNodes: TreeDataNode[] = [], checkedKeys = []): TreeDataNode[] =>
  treeNodes.map(({ children, ...props }) => ({
    ...props,
    disabled: checkedKeys.includes(props.key as string),
    children: generateTree(children, checkedKeys),
  }));

const dataSource: TreeDataNode[] = [
  { key: '0-0', title: '0-0' },
  {
    key: '0-1',
    title: '0-1',
    children: [
      { key: '0-1-0', title: '0-1-0' },
      { key: '0-1-1', title: '0-1-1' },
    ],
  },
  { key: '0-2', title: '0-2' },
  { key: '0-3', title: '0-3' },
  { key: '0-4', title: '0-4' },
];

const { token } = theme.useToken();

const targetKeys = ref([]);

const transferDataSource: TransferItem[] = [];
function flatten(list: TreeDataNode[] = []) {
  list.forEach((item) => {
    transferDataSource.push(item as TransferItem);
    flatten(item.children);
  });
}
flatten(dataSource);
</script>
<template>
  <Transfer
    :data-source="transferDataSource"
    v-model:target-keys="targetKeys"
    class="tree-transfer"
    :render="(item) => `${item.title}`"
    :show-select-all="false"
  >
    <template #default="{ direction, onItemSelect, selectedKeys }">
      <div v-if="direction === 'left'" :style="{ padding: token.paddingXS }">
        <Tree
          block-node
          checkable
          check-strictly
          default-expand-all
          :checked-keys="[...selectedKeys, ...targetKeys]"
          :tree-data="generateTree(dataSource, targetKeys)"
          @check="(_, { node: { key } }) => {
            console.log(key)
                  onItemSelect(key as string, !isChecked([...selectedKeys, ...targetKeys], key));
                }"
          @select="(_, { node: { key } }) => {
                  onItemSelect(key as string, !isChecked([...selectedKeys, ...targetKeys], key));
                }"
        />
      </div>
    </template>
  </Transfer>
</template>
