<script lang="tsx" setup>
import { Timeline, type TimelineProps } from '@/components';

const sharedProps: TimelineProps = {
  items: [
    {
      content: 'Create a services site 2015-09-01',
    },
    {
      content: 'Solve initial network problems 2015-09-01',
      styles: {
        root: {
          height: `${100}px`,
        },
        rail: {
          borderStyle: 'dashed',
        },
      },
    },
    {
      content: '...for a long time...',
      styles: {
        root: {
          height: '100px',
        },
        rail: {
          borderStyle: 'dashed',
        },
        content: {
          opacity: 0.45,
        },
      },
    },
    {
      content: 'Technical testing 2015-09-01',
    },

    {
      content: 'Network problems being solved 2015-09-01',
    },
  ],
};
</script>
<template>
  <Timeline v-bind="sharedProps" />
</template>
