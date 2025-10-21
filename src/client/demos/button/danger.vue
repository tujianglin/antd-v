<script lang="tsx" setup>
import { Button, Flex } from '@/components';
</script>
<template>
  <Flex wrap gap="small">
    <Button type="primary" danger> Primary </Button>
    <Button danger>Default</Button>
    <Button type="dashed" danger> Dashed </Button>
    <Button type="text" danger> Text </Button>
    <Button type="link" danger> Link </Button>
  </Flex>
</template>
