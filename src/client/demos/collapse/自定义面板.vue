<script lang="tsx" setup>
import { Collapse, theme, type CollapseProps } from '@/components';
import { CaretRightOutlined } from '@ant-design/icons-vue';
import { h, type CSSProperties } from 'vue';

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (panelStyle) => [
  {
    key: '1',
    label: 'This is panel header 1',
    children: <p>{text}</p>,
    style: panelStyle,
  },
  {
    key: '2',
    label: 'This is panel header 2',
    children: <p>{text}</p>,
    style: panelStyle,
  },
  {
    key: '3',
    label: 'This is panel header 3',
    children: <p>{text}</p>,
    style: panelStyle,
  },
];

const { token } = theme.useToken();

const panelStyle: CSSProperties = {
  marginBottom: `${24}px`,
  background: token.value.colorFillAlter,
  borderRadius: token.value.borderRadiusLG,
  border: 'none',
};
</script>
<template>
  <Collapse
    :items="getItems(panelStyle)"
    :bordered="false"
    :expand-icon="({ isActive }) => h(CaretRightOutlined, { rotate: isActive ? 90 : 0 })"
    :style="{ background: token.colorBgContainer }"
  />
</template>
