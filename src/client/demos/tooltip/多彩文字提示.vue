<script lang="tsx" setup>
import { Button, Divider, Space, Tooltip } from '@/components';

const colors = [
  'pink',
  'red',
  'yellow',
  'orange',
  'cyan',
  'green',
  'blue',
  'purple',
  'geekblue',
  'magenta',
  'volcano',
  'gold',
  'lime',
];

const customColors = ['#f50', '#2db7f5', '#87d068', '#108ee9'];
</script>
<template>
  <Divider title-placement="start">Presets</Divider>
  <Space wrap>
    <Tooltip v-for="color in colors" title="prompt text" :color="color" :key="color">
      <Button>{{ color }}</Button>
    </Tooltip>
  </Space>
  <Divider title-placement="start">Custom</Divider>
  <Space wrap>
    <Tooltip v-for="color in customColors" title="prompt text" :color="color" :key="color">
      <Button>{{ color }}</Button>
    </Tooltip>
  </Space>
</template>
