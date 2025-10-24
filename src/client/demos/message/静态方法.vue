<script lang="tsx">
import { Button, message } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const info = () => {
      message.info('This is a normal message');
    };
    return () => (
      <>
        <Button type="primary" onClick={info}>
          Static Method
        </Button>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
