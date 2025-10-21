<script lang="tsx" setup>
import { Cascader, Divider } from '@/components';

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

const options: Option[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            label: 'West Lake',
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [
          {
            value: 'zhonghuamen',
            label: 'Zhong Hua Men',
          },
        ],
      },
    ],
  },
];

const popupRender = (menus) => (
  <div>
    {menus}
    <Divider style={{ margin: 0 }} />
    <div style={{ padding: '8px' }}>The footer is not very short.</div>
  </div>
);
</script>
<template>
  <Cascader :options="options" :popup-render="popupRender" placeholder="Please select" />
</template>
