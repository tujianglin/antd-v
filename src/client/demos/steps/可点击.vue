<script lang="tsx" setup>
import { Divider, Steps } from '@/components';
import { ref } from 'vue';

const current = ref(0);
const onChange = (value: number) => {
  console.log('onChange:', value);
  current.value = value;
};
const content = 'This is a content.';
</script>
<template>
  <Steps
    :current="current"
    @change="onChange"
    :items="[
      {
        title: 'Step 1',
        content,
      },
      {
        title: 'Step 2',
        content,
      },
      {
        title: 'Step 3',
        content,
      },
    ]"
  />

  <Divider />

  <Steps
    :current="current"
    @change="onChange"
    orientation="vertical"
    :items="[
      {
        title: 'Step 1',
        content,
      },
      {
        title: 'Step 2',
        content,
      },
      {
        title: 'Step 3',
        content,
      },
    ]"
  />
</template>
