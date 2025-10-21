<script lang="tsx" setup>
import { Cascader } from '@/components';
import { effect, ref } from 'vue';

interface Option {
  value: string;
  label: string;
  children?: Option[];
  code?: number;
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
            code: 752100,
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
            code: 453400,
          },
        ],
      },
    ],
  },
];

const value = ref(['zhejiang', 'hangzhou', 'xihu']);

effect(() => {
  console.log(value.value);
});

const displayRender = (labels, selectedOptions = []) =>
  labels.map((label, i) => {
    const option = selectedOptions?.[i] || {};
    if (i === labels.length - 1) {
      return (
        <span key={option?.value}>
          {label} (<a>{option.code}</a>)
        </span>
      );
    }
    return <span key={option.value}>{label} / </span>;
  });
</script>
<template>
  <Cascader
    :options="options"
    v-model:value="value"
    :display-render="displayRender"
    class="!w-full"
    :option-render="(option) => `${option.label} (${option.value})`"
  />
</template>
