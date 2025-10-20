<script lang="tsx" setup>
import { ConfigProvider } from '@/components';
import zhCN from '@/components/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import Demo from './Demo';
</script>
<template>
  <div style="margin: 100px">
    <ConfigProvider :locale="zhCN">
      <Demo />
    </ConfigProvider>
  </div>
</template>
