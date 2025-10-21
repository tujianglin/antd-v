<script lang="tsx" setup>
import { Steps } from '@/components';

const content = 'This is a content.';
const items = [
  {
    title: 'Finished',
    content,
  },
  {
    title: 'In Progress',
    content,
  },
  {
    title: 'Waiting',
    content,
  },
];
</script>
<template>
  <Steps :current="1" title-placement="vertical" :items="items" ellipsis />
  <br />
  <Steps :current="1" :percent="60" title-placement="vertical" :items="items" />
  <br />
  <Steps :current="1" :percent="80" size="small" title-placement="vertical" :items="items" />
</template>
