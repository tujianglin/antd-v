<script lang="tsx" setup>
import { Button, Flex } from '@/components';
</script>
<template>
  <Flex vertical gap="small" style="width: 100%">
    <Button type="primary" block> Primary </Button>
    <Button block>Default</Button>
    <Button type="dashed" block> Dashed </Button>
    <Button disabled block> disabled </Button>
    <Button type="text" block> text </Button>
    <Button type="link" block> Link </Button>
  </Flex>
</template>
