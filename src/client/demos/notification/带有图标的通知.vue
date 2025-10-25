<script lang="tsx">
import { Button, notification, Space } from '@/components';

import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [api, ContextHolder] = notification.useNotification();

    const openNotificationWithIcon = (type) => {
      api[type]({
        title: 'Notification Title',
        description:
          'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
      });
    };
    return () => (
      <>
        <ContextHolder></ContextHolder>
        <Space>
          <Button onClick={() => openNotificationWithIcon('success')}>Success</Button>
          <Button onClick={() => openNotificationWithIcon('info')}>Info</Button>
          <Button onClick={() => openNotificationWithIcon('warning')}>Warning</Button>
          <Button onClick={() => openNotificationWithIcon('error')}>Error</Button>
        </Space>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
