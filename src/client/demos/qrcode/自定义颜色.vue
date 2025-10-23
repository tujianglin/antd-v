<script lang="tsx" setup>
import { QRCode, Space, theme } from '@/components';

const { useToken } = theme;
const { token } = useToken();
</script>
<template>
  <Space>
    <QRCode value="https://ant.design/" :color="token.colorSuccessText" />
    <QRCode value="https://ant.design/" :color="token.colorInfoText" :bg-color="token.colorBgLayout" />
  </Space>
</template>
