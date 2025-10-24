<script lang="tsx">
import { Button, message } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [messageApi, ContextHolder] = message.useMessage();

    const success = () => {
      messageApi.open({
        type: 'success',
        content: 'This is a prompt message for success, and it will disappear in 10 seconds',
        duration: 10,
      });
    };

    return () => (
      <>
        <ContextHolder></ContextHolder>
        <Button onClick={success}>Customized display duration</Button>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
