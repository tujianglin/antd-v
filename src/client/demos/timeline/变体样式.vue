<script lang="tsx" setup>
import { Timeline } from '@/components';
</script>
<template>
  <Timeline
    variant="filled"
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
        content: 'Network problems being solved 2015-09-01',
      },
    ]"
  />
</template>
