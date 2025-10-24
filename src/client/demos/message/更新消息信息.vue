<script lang="tsx">
import { Button, message } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [messageApi, ContextHolder] = message.useMessage();
    const key = 'updatable';

    const openMessage = () => {
      messageApi.open({
        key,
        type: 'loading',
        content: 'Loading...',
      });
      setTimeout(() => {
        messageApi.open({
          key,
          type: 'success',
          content: 'Loaded!',
          duration: 2,
        });
      }, 1000);
    };
    return () => (
      <>
        <ContextHolder></ContextHolder>
        <Button type="primary" onClick={openMessage}>
          Open the message box
        </Button>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
