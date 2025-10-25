<script lang="tsx">
import { Button, notification, Space } from '@/components';

import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [api, ContextHolder] = notification.useNotification();

    const close = () => {
      console.log('Notification was closed. Either the close button was clicked or duration time elapsed.');
    };
    const openNotification = () => {
      const key = `open${Date.now()}`;
      const btn = (
        <Space>
          <Button type="link" size="small" onClick={() => api.destroy()}>
            Destroy All
          </Button>
          <Button type="primary" size="small" onClick={() => api.destroy(key)}>
            Confirm
          </Button>
        </Space>
      );
      api.open({
        title: 'Notification Title',
        description:
          'A function will be be called after the notification is closed (automatically after the "duration" time of manually).',
        actions: btn,
        key,
        onClose: close,
      });
    };
    return () => (
      <>
        <ContextHolder></ContextHolder>
        <Button type="primary" onClick={openNotification}>
          Open the notification box
        </Button>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
