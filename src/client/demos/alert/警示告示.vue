<script lang="tsx">
import { Alert, Button, Space } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    return () => (
      <>
        <Alert
          title="Success Tips"
          type="success"
          showIcon
          action={
            <Button size="small" type="text">
              UNDO
            </Button>
          }
          closable
        />
        <br />
        <Alert
          title="Error Text"
          showIcon
          description="Error Description Error Description Error Description Error Description"
          type="error"
          action={
            <Button size="small" danger>
              Detail
            </Button>
          }
        />
        <br />
        <Alert
          title="Warning Text"
          type="warning"
          action={
            <Space>
              <Button type="text" size="small">
                Done
              </Button>
            </Space>
          }
          closable
        />
        <br />
        <Alert
          title="Info Text"
          description="Info Description Info Description Info Description Info Description"
          type="info"
          action={
            <Space vertical>
              <Button size="small" type="primary">
                Accept
              </Button>
              <Button size="small" danger ghost>
                Decline
              </Button>
            </Space>
          }
          closable
        />
        ;
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
