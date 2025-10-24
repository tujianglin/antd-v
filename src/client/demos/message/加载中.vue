<script lang="tsx">
import { Button, message } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [messageApi, ContextHolder] = message.useMessage();

    const success = () => {
      messageApi.open({
        type: 'loading',
        content: 'Action in progress..',
        duration: 0,
      });
      // Dismiss manually and asynchronously
      setTimeout(messageApi.destroy, 2500);
    };
    return () => (
      <>
        <ContextHolder></ContextHolder>
        <Button onClick={success}>Display a loading indicator</Button>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
