<script lang="tsx" setup>
import { Button, Empty } from '@/components';
</script>
<template>
  <Empty image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg" :styles="{ image: { height: `${60}px` } }">
    <Button type="primary">Create Now</Button>
    <template #description> Customize <a href="#API">Description</a> </template>
  </Empty>
</template>
