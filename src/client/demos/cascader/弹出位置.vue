<script lang="tsx" setup>
import { Cascader, Radio } from '@/components';
import { ref } from 'vue';

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

const placement = ref<'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'>('topLeft');
</script>
<template>
  <Radio.Group
    v-model:value="placement"
    option-type="button"
    :options="[
      { label: 'topLeft', value: 'topLeft' },
      { label: 'topRight', value: 'topRight' },
      { label: 'bottomLeft', value: 'bottomLeft' },
      { label: 'bottomRight', value: 'bottomRight' },
    ]"
  />
  <br />
  <br />
  <Cascader :options="options" placeholder="Please select" :placement="placement" />
</template>
