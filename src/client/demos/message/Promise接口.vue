<script lang="tsx">
import { Button, message } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [messageApi, ContextHolder] = message.useMessage();

    const success = () => {
      messageApi
        .open({
          type: 'loading',
          content: 'Action in progress..',
          duration: 2.5,
        })
        .then(() => messageApi.success('Loading finished', 2.5))
        .then(() => messageApi.info('Loading finished', 2.5));
    };
    return () => (
      <>
        <ContextHolder></ContextHolder>
        <Button onClick={success}>Display sequential messages</Button>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
