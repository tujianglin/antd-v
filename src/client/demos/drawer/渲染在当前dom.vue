<script lang="tsx">
import { Button, Drawer, theme } from '@/components';
import { defineComponent, ref, type CSSProperties } from 'vue';
export default defineComponent({
  setup() {
    const { token } = theme.useToken();
    const open = ref(false);

    const showDrawer = () => {
      open.value = true;
    };

    const onClose = () => {
      open.value = false;
    };

    const containerStyle: CSSProperties = {
      position: 'relative',
      height: `${200}px`,
      padding: `${48}px`,
      overflow: 'hidden',
      background: token.value.colorFillAlter,
      border: `1px solid ${token.value.colorBorderSecondary}`,
      borderRadius: token.value.borderRadiusLG,
    };

    return () => (
      <>
        <div style={containerStyle}>
          Render in this
          <div style={{ marginTop: '16px' }}>
            <Button type="primary" onClick={showDrawer}>
              Open
            </Button>
          </div>
          <Drawer
            title="Basic Drawer"
            placement="right"
            closable={false}
            onClose={onClose}
            open={open.value}
            getContainer={false}
          >
            <p>Some contents...</p>
          </Drawer>
        </div>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
