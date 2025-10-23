<script lang="tsx" setup>
import { QRCode, Space } from '@/components';
</script>
<template>
  <Space>
    <QRCode type="canvas" value="https://ant.design/" />
    <QRCode type="svg" value="https://ant.design/" />
  </Space>
</template>
