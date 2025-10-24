<script lang="tsx">
import { Button, Drawer } from '@/components';
import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {
    const open = ref(false);
    const childrenDrawer = ref(false);

    const showDrawer = () => {
      open.value = true;
    };

    const onClose = () => {
      open.value = false;
    };

    const showChildrenDrawer = () => {
      childrenDrawer.value = true;
    };

    const onChildrenDrawerClose = () => {
      childrenDrawer.value = false;
    };
    return () => (
      <>
        <Button type="primary" onClick={showDrawer}>
          Open drawer
        </Button>
        <Drawer title="Multi-level drawer" size={520} closable={false} onClose={onClose} open={open.value}>
          <Button type="primary" onClick={showChildrenDrawer}>
            Two-level drawer
          </Button>
          <Drawer
            title="Two-level Drawer"
            size={320}
            closable={false}
            onClose={onChildrenDrawerClose}
            open={childrenDrawer.value}
          >
            This is two-level drawer
          </Drawer>
        </Drawer>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
