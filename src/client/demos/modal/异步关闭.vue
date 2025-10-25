<script lang="tsx">
import { Button, Modal } from '@/components';
import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {
    const open = ref(false);
    const confirmLoading = ref(false);
    const modalText = ref('Content of the modal');

    const showModal = () => {
      open.value = true;
    };

    const handleOk = () => {
      modalText.value = 'The modal will be closed after two seconds';
      confirmLoading.value = true;
      setTimeout(() => {
        open.value = false;
        confirmLoading.value = false;
      }, 2000);
    };

    const handleCancel = () => {
      console.log('Clicked cancel button');
      open.value = false;
    };

    return () => (
      <>
        <Button type="primary" onClick={showModal}>
          Open Modal with async logic
        </Button>
        <Modal title="Title" open={open.value} onOk={handleOk} confirmLoading={confirmLoading.value} onCancel={handleCancel}>
          <p>{modalText.value}</p>
        </Modal>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
