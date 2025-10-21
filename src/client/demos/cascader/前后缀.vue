<script lang="tsx" setup>
import { Cascader } from '@/components';
import { SmileOutlined } from '@ant-design/icons-vue';

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
</script>
<template>
  <Cascader :suffix-icon="SmileOutlined" :options="options" placeholder="Please select" />
  <br />
  <br />
  <Cascader suffix-icon="ab" :options="options" placeholder="Please select" />
  <br />
  <br />
  <Cascader :expand-icon="SmileOutlined" :options="options" placeholder="Please select" />
  <br />
  <br />
  <Cascader expand-icon="ab" :options="options" placeholder="Please select" />
  <br />
  <br />
  <Cascader :prefix="SmileOutlined" :options="options" placeholder="Please select" />
</template>
