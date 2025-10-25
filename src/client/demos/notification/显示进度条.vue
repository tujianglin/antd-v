<script lang="tsx">
import { Button, notification, Space } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [api, ContextHolder] = notification.useNotification();

    const openNotification = (pauseOnHover: boolean) => () => {
      api.open({
        title: 'Notification Title',
        description:
          'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
        showProgress: true,
        pauseOnHover,
      });
    };
    return () => (
      <>
        <ContextHolder></ContextHolder>
        <Space>
          <Button type="primary" onClick={openNotification(true)}>
            Pause on hover
          </Button>
          <Button type="primary" onClick={openNotification(false)}>
            Don&apos;t pause on hover
          </Button>
        </Space>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
