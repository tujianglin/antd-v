<script lang="tsx" setup>
import { Input, Tree, type TreeDataNode } from '@/components';
import type { VueKey } from '@/vc-util/type';
import { computed, ref } from 'vue';

const { Search } = Input;

const x = 3;
const y = 2;
const z = 1;
const defaultData: TreeDataNode[] = [];

const generateData = (_level: number, _preKey?: any, _tns?: TreeDataNode[]) => {
  const preKey = _preKey || '0';
  const tns = _tns || defaultData;

  const children: any[] = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, key, tns[index].children);
  });
};
generateData(z);

const dataList: { key: any; title: string }[] = [];
const generateList = (data: TreeDataNode[]) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const { key } = node;
    dataList.push({ key, title: key as string });
    if (node.children) {
      generateList(node.children);
    }
  }
};
generateList(defaultData);

const getParentKey = (key: any, tree: TreeDataNode[]): any => {
  let parentKey: any;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

const expandedKeys = ref<VueKey[]>([]);
const searchValue = ref('');
const autoExpandParent = ref(true);

const onExpand = (newExpandedKeys: VueKey[]) => {
  expandedKeys.value = newExpandedKeys;
  autoExpandParent.value = false;
};

const onChange = (e) => {
  const { value } = e.target;
  const newExpandedKeys = dataList
    .map((item) => {
      if (item.title.indexOf(value) > -1) {
        return getParentKey(item.key, defaultData);
      }
      return null;
    })
    .filter((item, i, self): item is VueKey => !!(item && self.indexOf(item) === i));
  expandedKeys.value = newExpandedKeys;
  searchValue.value = value;
  console.log(1);
  autoExpandParent.value = true;
};

const treeData = computed(() => {
  const loop = (data: TreeDataNode[]): TreeDataNode[] =>
    data.map((item) => {
      const strTitle = item.title as string;
      const index = strTitle.indexOf(searchValue.value);
      const beforeStr = strTitle.substring(0, index);
      const afterStr = strTitle.slice(index + searchValue.value.length);
      const title =
        index > -1 ? (
          <span key={item.key}>
            {beforeStr}
            <span class="!text-[red]">{searchValue.value}</span>
            {afterStr}
          </span>
        ) : (
          <span key={item.key}>{strTitle}</span>
        );
      if (item.children) {
        return { title, key: item.key, children: loop(item.children) };
      }

      return {
        title,
        key: item.key,
      };
    });

  return loop(defaultData);
});
</script>
<template>
  <div>
    <Search :style="{ marginBottom: '8px' }" placeholder="Search" v-model:value="searchValue" @input="onChange" />
    <Tree @expand="onExpand" :expanded-keys="expandedKeys" :auto-expand-parent="autoExpandParent" :tree-data="treeData" />
  </div>
</template>
