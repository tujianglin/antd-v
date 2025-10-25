<script lang="tsx">
import { Button, Drawer, Flex, Modal, Watermark } from '@/components';
import { defineComponent, ref, type CSSProperties } from 'vue';

const style: CSSProperties = {
  height: '300px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(150, 150, 150, 0.2)',
};

const placeholder = <div style={style}>A mock height</div>;

export default defineComponent({
  setup() {
    const showModal = ref(false);
    const showDrawer = ref(false);
    const showDrawer2 = ref(false);

    const closeModal = () => (showModal.value = false);
    const closeDrawer = () => (showDrawer.value = false);
    const closeDrawer2 = () => (showDrawer2.value = false);
    return () => (
      <>
        <Flex gap="middle">
          <Button type="primary" onClick={() => (showModal.value = true)}>
            Show in Modal
          </Button>
          <Button type="primary" onClick={() => (showDrawer.value = true)}>
            Show in Drawer
          </Button>
          <Button type="primary" onClick={() => (showDrawer2.value = true)}>
            Not Show in Drawer
          </Button>
        </Flex>
        <Watermark content="Ant Design">
          <Modal destroyOnHidden open={showModal.value} title="Modal" onCancel={closeModal} onOk={closeModal}>
            {placeholder}
          </Modal>
          <Drawer destroyOnHidden open={showDrawer.value} title="Drawer" onClose={closeDrawer}>
            {placeholder}
          </Drawer>
        </Watermark>
        <Watermark content="Ant Design" inherit={false}>
          <Drawer destroyOnHidden open={showDrawer2.value} title="Drawer" onClose={closeDrawer2}>
            {placeholder}
          </Drawer>
        </Watermark>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
