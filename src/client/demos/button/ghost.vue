<script lang="tsx" setup>
import { Button, Flex } from '@/components';
</script>
<template>
  <Flex wrap gap="small" class="bg-[#bec8c8] !p-4">
    <Button type="primary" ghost> Primary </Button>
    <Button ghost>Default</Button>
    <Button type="dashed" ghost> Dashed </Button>
    <Button type="primary" danger ghost> Danger </Button>
  </Flex>
</template>
