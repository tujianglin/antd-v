<script lang="tsx" setup>
import { Flex, TreeSelect } from '@/components';
import type { CSSProperties } from 'vue';

const style: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
};
</script>
<template>
  <Flex vertical gap="middle">
    <TreeSelect :style="style" placeholder="Please select" variant="borderless" />
    <TreeSelect :style="style" placeholder="Please select" variant="filled" />
    <TreeSelect :style="style" placeholder="Please select" variant="outlined" />
    <TreeSelect :style="style" placeholder="Please select" variant="underlined" />
  </Flex>
</template>
