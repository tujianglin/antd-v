<script lang="tsx" setup>
import { Cascader, Flex, Switch } from '@/components';
import { ref } from 'vue';

interface Option {
  value: string | number;
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

const disabled = ref(false);
</script>
<template>
  <Flex vertical gap="small" align="flex-start">
    <Switch v-model:checked="disabled" checked-children="Enabled" un-checked-children="Disabled" aria-label="disabled switch" />
    <Cascader.Panel :options="options" :disabled="disabled" />
    <Cascader.Panel multiple :options="options" :disabled="disabled" />
    <Cascader.Panel />
  </Flex>
</template>
