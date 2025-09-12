<script lang="tsx">
import { ColorPicker } from '@/components';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const value = ref('#00ff00');

    return () => (
      <div style={{ margin: '100px' }}>
        <ColorPicker v-model:value={value.value} format="rgb" showText allowClear />
      </div>
    );
  },
});
</script>
<style lang="less" scoped></style>
