<script lang="tsx" setup>
import { Flex, InputNumber } from '@/components';
</script>
<template>
  <Flex vertical :gap="12">
    <InputNumber placeholder="Outlined" class="!w-50" />
    <InputNumber placeholder="Filled" variant="filled" class="!w-50" />
    <InputNumber placeholder="Borderless" variant="borderless" class="!w-50" />
    <InputNumber placeholder="Underlined" variant="underlined" class="!w-50" />
  </Flex>
</template>
