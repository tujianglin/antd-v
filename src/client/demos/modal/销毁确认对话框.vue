<script lang="tsx">
import { Button, Modal } from '@/components';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const { confirm } = Modal;

    const destroyAll = () => {
      Modal.destroyAll();
    };

    const showConfirm = () => {
      for (let i = 0; i < 3; i += 1) {
        setTimeout(() => {
          confirm({
            icon: <ExclamationCircleOutlined />,
            content: <Button onClick={destroyAll}>Click to destroy all</Button>,
            onOk() {
              console.log('OK');
            },
            onCancel() {
              console.log('Cancel');
            },
          });
        }, i * 500);
      }
    };

    return () => (
      <>
        <Button onClick={showConfirm}>Confirm</Button>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
