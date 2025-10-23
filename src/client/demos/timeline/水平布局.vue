<script lang="tsx" setup>
import { Divider, Flex, Timeline, type TimelineProps } from '@/components';

const sharedProps: TimelineProps = {
  orientation: 'horizontal',
  items: [
    {
      content: 'Init',
    },
    {
      content: 'Start',
    },
    {
      content: 'Pending',
    },
    {
      content: 'Complete',
    },
  ],
};
</script>
<template>
  <Flex vertical>
    <Timeline v-bind="sharedProps" mode="start" />
    <Divider />
    <Timeline v-bind="sharedProps" mode="end" />
    <Divider />
    <Timeline v-bind="sharedProps" mode="alternate" />
  </Flex>
</template>
