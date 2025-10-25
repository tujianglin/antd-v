<script lang="tsx">
import { Button, Modal, Space } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [modal, ContextHolder] = Modal.useModal();
    const config = {
      title: 'Use Hook!',
      content: (
        <>
          11111111
          <br />
          2222222
        </>
      ),
    };

    return () => (
      <>
        <Space>
          <Button
            onClick={async () => {
              const confirmed = await modal.confirm(config);
              console.log('Confirmed: ', confirmed);
            }}
          >
            Confirm
          </Button>
          <Button
            onClick={() => {
              modal.warning(config);
            }}
          >
            Warning
          </Button>
          <Button
            onClick={async () => {
              modal.info(config);
            }}
          >
            Info
          </Button>
          <Button
            onClick={async () => {
              modal.error(config);
            }}
          >
            Error
          </Button>
        </Space>
        {/* `contextHolder` should always be placed under the context you want to access */}
        <ContextHolder></ContextHolder>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
