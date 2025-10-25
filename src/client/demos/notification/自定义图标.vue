<script lang="tsx">
import { Button, notification } from '@/components';
import { SmileOutlined } from '@ant-design/icons-vue';

import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [api, ContextHolder] = notification.useNotification();

    const openNotification = () => {
      api.open({
        title: 'Notification Title',
        description:
          'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
        icon: <SmileOutlined style={{ color: '#108ee9' }} />,
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
