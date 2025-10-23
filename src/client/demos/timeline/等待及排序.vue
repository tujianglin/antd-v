<script lang="tsx" setup>
import { Button, Flex, Timeline } from '@/components';
import { ref } from 'vue';

const reverse = ref(false);

const handleClick = () => {
  reverse.value = !reverse.value;
};
</script>
<template>
  <Flex vertical gap="middle" align="flex-start">
    <Timeline
      :reverse="reverse"
      :items="[
        {
          content: 'Create a services site 2015-09-01',
        },
        {
          content: 'Solve initial network problems 2015-09-01',
        },
        {
          content: 'Technical testing 2015-09-01',
        },
        {
          loading: true,
          content: 'Recording...',
        },
      ]"
    />
    <Button type="primary" @click="handleClick"> Toggle Reverse </Button>
  </Flex>
</template>
