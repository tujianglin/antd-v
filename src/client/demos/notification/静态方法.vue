<script lang="tsx">
import { Button, notification } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const openNotification = () => {
      notification.open({
        title: 'Notification Title',
        description:
          'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
        onClick: () => {
          console.log('Notification Clicked!');
        },
      });
    };
    return () => (
      <>
        <Button type="primary" onClick={openNotification}>
          Open the notification box
        </Button>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
