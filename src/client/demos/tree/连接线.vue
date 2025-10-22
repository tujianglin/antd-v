<script lang="tsx" setup>
import { Select, Switch, Tree, type TreeDataNode } from '@/components';
import type { VueKey, VueNode } from '@/vc-util/type';
import { CarryOutOutlined, CheckOutlined, FormOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

const treeData: TreeDataNode[] = [
  {
    title: 'parent 1',
    key: '0-0',
    icon: <CarryOutOutlined />,
    children: [
      {
        title: 'parent 1-0',
        key: '0-0-0',
        icon: <CarryOutOutlined />,
        children: [
          { title: 'leaf', key: '0-0-0-0', icon: <CarryOutOutlined /> },
          {
            title: (
              <>
                <div>multiple line title</div>
                <div>multiple line title</div>
              </>
            ),
            key: '0-0-0-1',
            icon: <CarryOutOutlined />,
          },
          { title: 'leaf', key: '0-0-0-2', icon: <CarryOutOutlined /> },
        ],
      },
      {
        title: 'parent 1-1',
        key: '0-0-1',
        icon: <CarryOutOutlined />,
        children: [{ title: 'leaf', key: '0-0-1-0', icon: <CarryOutOutlined /> }],
      },
      {
        title: 'parent 1-2',
        key: '0-0-2',
        icon: <CarryOutOutlined />,
        children: [
          { title: 'leaf', key: '0-0-2-0', icon: <CarryOutOutlined /> },
          {
            title: 'leaf',
            key: '0-0-2-1',
            icon: <CarryOutOutlined />,
            switcherIcon: <FormOutlined />,
          },
        ],
      },
    ],
  },
  {
    title: 'parent 2',
    key: '0-1',
    icon: <CarryOutOutlined />,
    children: [
      {
        title: 'parent 2-0',
        key: '0-1-0',
        icon: <CarryOutOutlined />,
        children: [
          { title: 'leaf', key: '0-1-0-0', icon: <CarryOutOutlined /> },
          { title: 'leaf', key: '0-1-0-1', icon: <CarryOutOutlined /> },
        ],
      },
    ],
  },
];

const showLine = ref<boolean>(true);
const showIcon = ref<boolean>(false);
const showLeafIcon = ref<VueNode | boolean>(true);

const onSelect = (selectedKeys: VueKey[], info: any) => {
  console.log('selected', selectedKeys, info);
};

const handleLeafIconChange = (value: 'true' | 'false' | 'custom') => {
  if (value === 'custom') {
    return (showLeafIcon.value = <CheckOutlined />);
  }

  if (value === 'true') {
    return (showLeafIcon.value = true);
  }

  return (showLeafIcon.value = false);
};
</script>
<template>
  <div>
    <div :style="{ marginBottom: '16px' }">
      showLine: <Switch v-model:checked="showLine" />
      <br />
      <br />
      showIcon: <Switch v-model:checked="showIcon" />
      <br />
      <br />
      showLeafIcon:
      <Select
        value="true"
        @change="handleLeafIconChange"
        :options="[
          { value: 'true', label: 'True' },
          { value: 'false', label: 'False' },
          { value: 'custom', label: 'Custom icon' },
        ]"
      >
        >
      </Select>
    </div>
    <Tree
      :show-line="showLine ? { showLeafIcon } : false"
      :show-icon="showIcon"
      default-expand-all
      @select="onSelect"
      :tree-data="treeData"
    />
  </div>
</template>
