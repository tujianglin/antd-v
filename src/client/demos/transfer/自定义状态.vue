<script lang="tsx" setup>
import { Flex, Transfer } from '@/components';
</script>
<template>
  <Flex gap="middle" vertical>
    <Transfer status="error" />
    <Transfer status="warning" show-search />
  </Flex>
</template>
