<script lang="tsx">
import { Button, Drawer, Space } from '@/components';
import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {
    const open = ref(false);
    const loading = ref<boolean>(true);

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
          Open Drawer
        </Button>
        <Drawer
          closable
          destroyOnHidden
          title={<p>Loading Drawer</p>}
          placement="right"
          open={open.value}
          loading={loading.value}
          onClose={() => (open.value = false)}
          extra={
            <Space>
              <Button onClick={() => (open.value = false)}>Cancel</Button>
              <Button type="primary" onClick={() => (open.value = false)}>
                OK
              </Button>
            </Space>
          }
        >
          <Button type="primary" style={{ marginBottom: '16px' }} onClick={showLoading}>
            Reload
          </Button>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Drawer>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
