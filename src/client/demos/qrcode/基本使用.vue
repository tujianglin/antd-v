<script lang="tsx" setup>
import { Input, QRCode, Space } from '@/components';
import { ref } from 'vue';

const text = ref('https://ant.design/');
</script>
<template>
  <Space vertical align="center">
    <QRCode :value="text || '-'" />
    <Input placeholder="-" :maxlength="60" v-model:value="text" />
  </Space>
</template>
