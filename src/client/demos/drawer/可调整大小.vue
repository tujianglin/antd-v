<script lang="tsx">
import { Button, Drawer, Radio, Space, type DrawerProps, type RadioChangeEvent } from '@/components';
import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {
    const open = ref(false);
    const placement = ref<DrawerProps['placement']>('right');
    const size = ref(256);

    const onChange = (e: RadioChangeEvent) => {
      size.value = 256;
      placement.value = e.target.value;
    };
    return () => (
      <>
        <Space style={{ marginBottom: '16px' }}>
          <Radio.Group
            value={placement.value}
            onChange={onChange}
            options={['top', 'right', 'bottom', 'left'].map((pos) => ({
              label: pos,
              value: pos,
            }))}
          />
          <Button type="primary" onClick={() => (open.value = true)}>
            Open Drawer
          </Button>
        </Space>
        <div>Current size: {size.value}px</div>
        <Drawer
          title="Resizable Drawer"
          placement={placement.value}
          onClose={() => (open.value = false)}
          open={open.value}
          key={placement.value}
          size={size.value}
          resizable={{
            onResize: (newSize) => {
              console.log(newSize);
              size.value = newSize;
            },
          }}
        >
          <p>Drag the edge to resize the drawer</p>
          <p>Current size: {size.value}px</p>
        </Drawer>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
