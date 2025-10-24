<script lang="tsx">
import { Button, Drawer } from '@/components';
import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {
    const open = ref(false);

    const showDrawer = () => {
      open.value = true;
    };

    const onClose = () => {
      open.value = false;
    };
    return () => (
      <>
        <Button type="primary" onClick={showDrawer}>
          Open
        </Button>
        <Drawer title="Basic Drawer" closable={{ 'aria-label': 'Close Button' }} onClose={onClose} open={open.value}>
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
