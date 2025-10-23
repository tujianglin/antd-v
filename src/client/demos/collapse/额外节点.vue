<script lang="tsx" setup>
import { Collapse, Select, type CollapseProps } from '@/components';
import { SettingOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

const expandIconPlacement = ref<CollapseProps['expandIconPlacement']>('start');

const genExtra = () => (
  <SettingOutlined
    onClick={(event) => {
      // If you don't want click extra trigger collapse, you can prevent this:
      event.stopPropagation();
    }}
  />
);

const items: CollapseProps['items'] = [
  {
    key: '1',
    label: 'This is panel header 1',
    children: <div>{text}</div>,
    extra: genExtra(),
  },
  {
    key: '2',
    label: 'This is panel header 2',
    children: <div>{text}</div>,
    extra: genExtra(),
  },
  {
    key: '3',
    label: 'This is panel header 3',
    children: <div>{text}</div>,
    extra: genExtra(),
  },
];
const activeKey = ref(['1']);
</script>
<template>
  <Collapse v-model:active-key="activeKey" :expand-icon-placement="expandIconPlacement" :items="items" />
  <br />
  <span>Expand Icon Placement: </span>
  <Select
    v-model:value="expandIconPlacement"
    :style="{ margin: '0 8px' }"
    :options="[
      { value: 'start', label: 'start' },
      { value: 'end', label: 'end' },
    ]"
  />
</template>
