<script lang="tsx" setup>
import { QRCode, Segmented } from '@/components';
import { ref } from 'vue';

const level = ref<'L' | 'M' | 'Q' | 'H'>('L');
</script>
<template>
  <QRCode class="mb-4" :error-level="level" value="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" />
  <Segmented :options="['L', 'M', 'Q', 'H']" v-model:value="level" />
</template>
