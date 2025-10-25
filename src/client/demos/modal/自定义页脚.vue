<script lang="tsx">
import { Button, Modal } from '@/components';
import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {
    const open = ref(false);
    const loading = ref(false);

    const showModal = () => {
      open.value = true;
    };

    const handleOk = () => {
      loading.value = true;
      setTimeout(() => {
        loading.value = false;
        open.value = false;
      }, 3000);
    };

    const handleCancel = () => {
      open.value = false;
    };

    return () => (
      <>
        <Button type="primary" onClick={showModal}>
          Open Modal with customized footer
        </Button>
        <Modal
          open={open.value}
          title="Title"
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Return
            </Button>,
            <Button key="submit" type="primary" loading={loading.value} onClick={handleOk}>
              Submit
            </Button>,
            <Button
              key="link"
              href="https://google.com"
              target="_blank"
              type="primary"
              loading={loading.value}
              onClick={handleOk}
            >
              Search on Google
            </Button>,
          ]}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
