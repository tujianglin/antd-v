<script lang="tsx" setup>
import type { StepsProps } from '@/components';
import { Flex, Steps } from '@/components';
import { computed, ref } from 'vue';

const current = ref(0);

const onChange = (value: number) => {
  console.log('onChange:', value);
  current.value = value;
};

const sharedProps = computed<StepsProps>(() => ({
  type: 'panel',
  current: current.value,
  onChange,
  items: [
    {
      title: 'Step 1',
      subTitle: '00:00',
      content: 'This is a content.',
    },
    {
      title: 'Step 2',
      content: 'This is a content.',
      status: 'error',
    },
    {
      title: 'Step 3',
      content: 'This is a content.',
    },
  ],
}));
</script>
<template>
  <Flex vertical gap="middle">
    <Steps v-bind="sharedProps" />
    <Steps v-bind="sharedProps" size="small" variant="outlined" />
  </Flex>
</template>
