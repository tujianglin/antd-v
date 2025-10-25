<script lang="tsx">
import { Button, notification } from '@/components';
const key = 'updatable';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [api, ContextHolder] = notification.useNotification();

    const openNotification = () => {
      api.open({
        key,
        title: 'Notification Title',
        description: 'description.',
      });

      setTimeout(() => {
        api.open({
          key,
          title: 'New Title',
          description: 'New description.',
        });
      }, 1000);
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
