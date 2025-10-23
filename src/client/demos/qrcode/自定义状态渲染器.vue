<script lang="tsx" setup>
import { Button, Flex, QRCode, Space, Spin, type QRCodeProps } from '@/components';
import { CheckCircleFilled, CloseCircleFilled, ReloadOutlined } from '@ant-design/icons-vue';

const value = 'https://ant.design';
const customStatusRender: QRCodeProps['statusRender'] = (info) => {
  switch (info.status) {
    case 'expired':
      return (
        <div>
          <CloseCircleFilled style={{ color: 'red' }} /> {info.locale?.expired}
          <p>
            <Button type="link" onClick={info.onRefresh}>
              <ReloadOutlined /> {info.locale?.refresh}
            </Button>
          </p>
        </div>
      );
    case 'loading':
      return (
        <Space vertical>
          <Spin />
          <p>Loading...</p>
        </Space>
      );
    case 'scanned':
      return (
        <div>
          <CheckCircleFilled style={{ color: 'green' }} /> {info.locale?.scanned}
        </div>
      );
    default:
      return null;
  }
};
</script>
<template>
  <Flex gap="middle" wrap>
    <QRCode :value="value" status="loading" :status-render="customStatusRender" />
    <QRCode :value="value" status="expired" @refresh="() => console.log('refresh')" :status-render="customStatusRender" />
    <QRCode :value="value" status="scanned" :status-render="customStatusRender" />
  </Flex>
</template>
