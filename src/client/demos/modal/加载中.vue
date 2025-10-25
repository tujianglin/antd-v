<script lang="tsx">
import { Button, Modal } from '@/components';
import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {
    const open = ref(false);
    const loading = ref(false);

    const showLoading = () => {
      open.value = true;
      loading.value = true;

      // Simple loading mock. You should add cleanup logic in real world.
      setTimeout(() => {
        loading.value = false;
      }, 2000);
    };

    return () => (
      <>
        <Button type="primary" onClick={showLoading}>
          Open Modal
        </Button>
        <Modal
          title={<p>Loading Modal</p>}
          footer={
            <Button type="primary" onClick={showLoading}>
              Reload
            </Button>
          }
          loading={loading.value}
          open={open.value}
          onCancel={() => (open.value = false)}
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
