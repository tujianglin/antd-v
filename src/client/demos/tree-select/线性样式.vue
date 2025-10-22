<script lang="tsx" setup>
import { Space, Switch, TreeSelect } from '@/components';
import { CarryOutOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
const treeData = [
  {
    value: 'parent 1',
    title: 'parent 1',
    icon: <CarryOutOutlined />,
    children: [
      {
        value: 'parent 1-0',
        title: 'parent 1-0',
        icon: <CarryOutOutlined />,
        children: [
          {
            value: 'leaf1',
            title: 'leaf1',
            icon: <CarryOutOutlined />,
          },
          {
            value: 'leaf2',
            title: 'leaf2',
            icon: <CarryOutOutlined />,
          },
        ],
      },
      {
        value: 'parent 1-1',
        title: 'parent 1-1',
        icon: <CarryOutOutlined />,
        children: [
          {
            value: 'sss',
            title: 'sss',
            icon: <CarryOutOutlined />,
          },
        ],
      },
    ],
  },
];

const treeLine = ref(true);
const showLeafIcon = ref(true);
const showIcon = ref<boolean>(false);
</script>
<template>
  <Space vertical>
    <Switch checked-children="showIcon" un-checked-children="showIcon" v-model:checked="showIcon" />
    <Switch checked-children="treeLine" un-checked-children="treeLine" v-model:checked="treeLine" />
    <Switch
      :disabled="!treeLine"
      checked-children="showLeafIcon"
      un-checked-children="showLeafIcon"
      v-model:checked="showLeafIcon"
    />
    <TreeSelect
      :tree-line="{ showLeafIcon }"
      tree-default-expand-all
      :style="{ width: `${300}px` }"
      :tree-data="treeData"
      :tree-icon="showIcon"
    />
  </Space>
</template>
