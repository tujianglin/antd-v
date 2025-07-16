<script lang="tsx" setup>
import { Button, ConfigProvider } from '@/components';
</script>
<template>
  <ConfigProvider>
    <Button type="primary">绿色按钮</Button>
    <Button type="primary" danger>绿色按钮</Button>
    <ConfigProvider :theme="{ token: { colorPrimary: '#bae637' } }">
      <Button type="primary">11</Button>
      <Button type="primary">11</Button>
      <Button type="primary">11</Button>
      <Button type="primary">11</Button>
      <Button type="primary">11</Button>
      <Button type="primary">11</Button>
      <Button type="primary">11</Button>
    </ConfigProvider>
  </ConfigProvider>
</template>
