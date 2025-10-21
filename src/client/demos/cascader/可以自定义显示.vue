<script lang="tsx" setup>
import { Cascader } from '@/components';
import { effect, ref } from 'vue';

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
      },
    ],
  },
];

const value = ref([]);
const text = ref('Unselect');

effect(() => {
  console.log(value.value);
});
</script>
<template>
  <span>
    {{ text }} &nbsp;
    <Cascader v-model:value="value" :options="options">
      <a>Change city</a>
    </Cascader>
  </span>
</template>
