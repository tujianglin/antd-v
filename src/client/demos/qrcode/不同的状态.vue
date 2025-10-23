<script lang="tsx" setup>
import { Flex, QRCode } from '@/components';

const value = 'https://ant.design';
</script>
<template>
  <Flex gap="middle" wrap>
    <QRCode :value="value" status="loading" />
    <QRCode :value="value" status="expired" @refresh="() => console.log('refresh')" />
    <QRCode :value="value" status="scanned" />
  </Flex>
</template>
