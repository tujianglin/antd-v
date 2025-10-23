<script lang="tsx" setup>
import { Flex, Segmented } from '@/components';
</script>
<template>
  <Flex gap="small" align="flex-start" vertical>
    <Segmented :options="['Map', 'Transit', 'Satellite']" disabled />
    <Segmented
      :options="[
        'Daily',
        { label: 'Weekly', value: 'Weekly', disabled: true },
        'Monthly',
        { label: 'Quarterly', value: 'Quarterly', disabled: true },
        'Yearly',
      ]"
    />
  </Flex>
</template>
