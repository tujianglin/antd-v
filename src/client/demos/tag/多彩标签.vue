<script lang="tsx" setup>
import { Divider, Flex, Tag } from '@/components';

const variants = ['filled', 'solid', 'outlined'] as const;
const presets = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];
const customs = ['#f50', '#2db7f5', '#87d068', '#108ee9'];
</script>
<template>
  <div v-for="variant in variants" :key="variant">
    <Divider title-placement="start">Presets ({{ variant }})</Divider>
    <Flex gap="small" align="center" wrap>
      <Tag v-for="color in presets" :key="color" :color="color" :variant="variant">
        {{ color }}
      </Tag>
    </Flex>
  </div>
  <div v-for="variant in variants" :key="variant">
    <Divider title-placement="start">Presets ({{ variant }})</Divider>
    <Flex gap="small" align="center" wrap>
      <Tag v-for="color in customs" :key="color" :color="color" :variant="variant">
        {{ color }}
      </Tag>
    </Flex>
  </div>
</template>
