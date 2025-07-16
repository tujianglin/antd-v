<script lang="tsx" setup>
import { Button, ConfigProvider } from '@/components';
import AButton from './Button.vue';
</script>
<template>
  <ConfigProvider>
    <Button type="primary">默认按钮</Button>
    <AButton />
  </ConfigProvider>
</template>
