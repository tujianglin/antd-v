<script lang="tsx" setup>
import { Button, ConfigProvider } from '@/components';
import { ref } from 'vue';

const colorPrimary = ref('#ff0000');
</script>
<template>
  <Button @click="colorPrimary = '#00ff00'">按钮</Button>
  <ConfigProvider :theme="{ token: { colorPrimary } }">
    <Button type="primary">22222</Button>
    <ConfigProvider :theme="{ token: { colorPrimary: '#00ff00' } }">
      <Button type="primary">22222</Button>
    </ConfigProvider>
  </ConfigProvider>
</template>
