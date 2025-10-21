<script lang="tsx" setup>
import { Flex, Steps } from '@/components';

const content = 'This is a content';
const items = [
  {
    title: 'Finished',
    content,
  },
  {
    title: 'In Process',
    content,
  },
  {
    title: 'Waiting',
    content,
  },
];
</script>
<template>
  <Flex>
    <div class="flex-1">
      <Steps orientation="vertical" :current="1" :items="items" />
    </div>
    <div class="flex-1">
      <Steps orientation="vertical" :current="1" :items="items" size="small" />
    </div>
  </Flex>
</template>
