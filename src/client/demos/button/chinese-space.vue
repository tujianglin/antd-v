<script lang="tsx" setup>
import { Button, Flex } from '@/components';
</script>
<template>
  <Flex gap="small" wrap>
    <Button type="primary" autofocus :auto-insert-space="false"> 确定 </Button>
    <Button type="primary" auto-insert-space> 确定 </Button>
  </Flex>
</template>
