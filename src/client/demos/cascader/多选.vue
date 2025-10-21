<script lang="tsx" setup>
import { Cascader } from '@/components';
import { effect, ref } from 'vue';

interface Option {
  value: string | number;
  label: string;
  children?: Option[];
  disableCheckbox?: boolean;
}

const options: Option[] = [
  {
    label: 'Light',
    value: 'light',
    children: Array.from({ length: 20 }).map((_, index) => ({
      label: `Number ${index}`,
      value: index,
    })),
  },
  {
    label: 'Bamboo',
    value: 'bamboo',
    children: [
      {
        label: 'Little',
        value: 'little',
        children: [
          {
            label: 'Toy Fish',
            value: 'fish',
            disableCheckbox: true,
          },
          {
            label: 'Toy Cards',
            value: 'cards',
          },
          {
            label: 'Toy Bird',
            value: 'bird',
          },
        ],
      },
    ],
  },
];

const value = ref([]);

effect(() => {
  console.log(value.value);
});
</script>
<template>
  <Cascader
    v-model:value="value"
    :options="options"
    placeholder="Please select"
    multiple
    max-tag-count="responsive"
    class="!w-full"
  />
</template>
