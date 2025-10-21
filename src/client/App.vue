<script lang="tsx" setup>
import { Button, Modal, notification, ConfigProvider, App, Select } from '@/components';

function handleOpen() {
  Modal.confirm({
    centered: true,
    title: 'This is a notification message',
    content: (
      <div>
        <p>some messages...some messages...</p>
        <p>some messages...some messages...</p>
      </div>
    ),
    onOk() {},
  });
  notification.open({
    title: 'Notification Title',
    description:
      'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
    onClick: () => {
      console.log('Notification Clicked!');
    },
  });
}
</script>
<template>
  <ConfigProvider component-size="small" :theme="{ token: { colorPrimary: '#999999' } }">
    <App>
      <Button type="primary" @click="handleOpen">打开弹框</Button>
      <Modal :footer="null"> 11111</Modal>
      <Select />
    </App>
  </ConfigProvider>
</template>
