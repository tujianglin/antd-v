<script lang="tsx" setup>
import { Flex, Steps } from '@/components';

const content = 'This is a content.';
const items = [
  {
    title: 'Finished',
    content,
  },
  {
    title: 'In Progress',
    content,
    subTitle: 'Left 00:00:08',
  },
  {
    title: 'Waiting',
    content,
  },
];
</script>
<template>
  <Flex vertical gap="large">
    <Steps :current="1" :items="items" />
    <Steps :current="1" :items="items" variant="outlined" />
    <Steps :current="1" :items="items" size="small" />
    <Steps :current="1" :items="items" size="small" variant="outlined" />
  </Flex>
</template>
