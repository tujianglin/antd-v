<script lang="tsx">
import { Button, message, Space } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [messageApi, ContextHolder] = message.useMessage();

    const success = () => {
      messageApi.open({
        type: 'success',
        content: 'This is a success message',
      });
    };

    const error = () => {
      messageApi.open({
        type: 'error',
        content: 'This is an error message',
      });
    };

    const warning = () => {
      messageApi.open({
        type: 'warning',
        content: 'This is a warning message',
      });
    };

    return () => (
      <>
        <ContextHolder></ContextHolder>
        <Space>
          <Button onClick={success}>Success</Button>
          <Button onClick={error}>Error</Button>
          <Button onClick={warning}>Warning</Button>
        </Space>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
