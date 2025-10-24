<script lang="tsx">
import { Button, message } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [messageApi, ContextHolder] = message.useMessage();

    const info = () => {
      messageApi.info('Hello, Ant Design!');
    };

    return () => (
      <>
        <ContextHolder></ContextHolder>
        <Button type="primary" onClick={info}>
          Display normal message
        </Button>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
