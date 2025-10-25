<script lang="tsx">
import { Button, Result } from '@/components';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <Result
        status="success"
        title="Successfully Purchased Cloud Server ECS!"
        subTitle="Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait."
        extra={[
          <Button type="primary" key="console">
            Go Console
          </Button>,
          <Button key="buy">Buy Again</Button>,
        ]}
      />
    );
  },
});
</script>
<style lang="less" scoped></style>
