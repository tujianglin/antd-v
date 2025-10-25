<script lang="tsx">
import { Button, notification } from '@/components';

import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [api, ContextHolder] = notification.useNotification();

    const openNotification = () => {
      api.open({
        title: 'Notification Title',
        description:
          'I will never close automatically. This is a purposely very very long description that has many many characters and words.',
        duration: 0,
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
