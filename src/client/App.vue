<script lang="tsx" setup>
import { Button, Popover, QRCode } from '@/components';
</script>
<template>
  <Popover>
    <template #content>
      <QRCode value="https://ant.design" :bordered="false" />
    </template>
    <Button type="primary">Hover me</Button>
  </Popover>
</template>
