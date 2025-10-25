<script lang="tsx">
import { Button, Modal } from '@/components';
import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {
    const isModalOpen = ref(false);

    const showModal = () => {
      isModalOpen.value = true;
    };

    const handleOk = () => {
      isModalOpen.value = false;
    };

    const handleCancel = () => {
      isModalOpen.value = false;
    };
    return () => (
      <>
        <Button type="primary" onClick={showModal}>
          Open Modal
        </Button>
        <Modal
          title="Basic Modal"
          closable={{ 'aria-label': 'Custom Close Button' }}
          open={isModalOpen.value}
          onOk={handleOk}
          onCancel={handleCancel}
        >
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
