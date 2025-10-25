<script lang="tsx">
import { Button, Popconfirm } from '@/components';

import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const confirm = () =>
      new Promise((resolve) => {
        setTimeout(() => resolve(null), 3000);
      });

    return () => (
      <Popconfirm title="Title" description="Open Popconfirm with async logic" onConfirm={confirm}>
        <Button type="primary">Open Popconfirm with async logic</Button>
      </Popconfirm>
    );
  },
});
</script>
<style lang="less" scoped></style>
