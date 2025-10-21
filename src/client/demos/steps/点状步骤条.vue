<script lang="tsx" setup>
import type { StepsProps } from '@/components';
import { Divider, Flex, Steps } from '@/components';

const items = [
  {
    title: 'Finished',
    content: 'This is a content.',
  },
  {
    title: 'In Progress',
    content: 'This is a content.',
  },
  {
    title: 'Waiting',
    content: 'This is a content.',
  },
];

const sharedProps: StepsProps = {
  type: 'dot',
  current: 1,
  items,
};

const sharedVerticalProps = {
  ...sharedProps,
  orientation: 'vertical',
  style: {
    flex: 'auto',
  },
} as const;
</script>
<template>
  <Flex vertical gap="middle">
    <Steps v-bind="sharedProps" />
    <Steps v-bind="sharedProps" variant="outlined" />
    <Divider />
    <Flex gap="middle">
      <Steps v-bind="sharedVerticalProps" />
      <Steps v-bind="sharedVerticalProps" variant="outlined" />
    </Flex>
  </Flex>
</template>
