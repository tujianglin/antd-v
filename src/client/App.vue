<script lang="tsx" setup>
import { Flex, InputNumber } from '@/components';

const sharedProps = {
  mode: 'spinner' as const,
  min: 1,
  max: 10,
  style: { width: '150px' },
};
</script>
<template>
  <Flex orientation="vertical" gap="middle">
    <InputNumber v-bind="sharedProps" placeholder="Outlined" />
    <InputNumber v-bind="sharedProps" variant="filled" placeholder="Filled" />
  </Flex>
</template>
