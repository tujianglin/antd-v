<script lang="tsx" setup>
import { Collapse, type CollapseProps } from '@/components';
import { ref } from 'vue';

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

const items: CollapseProps['items'] = [
  {
    key: '1',
    label: 'This is panel header 1',
    children: <p>{text}</p>,
  },
  {
    key: '2',
    label: 'This is panel header 2',
    children: <p>{text}</p>,
  },
  {
    key: '3',
    label: 'This is panel header 3',
    children: <p>{text}</p>,
  },
];

const activeKey = ref(['1']);
</script>
<template>
  <Collapse :items="items" v-model:active-key="activeKey" />
</template>
