<script lang="tsx">
import { Watermark } from '@/components';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <Watermark content={['Ant Design', 'Happy Working']}>
        <div style={{ height: '500px' }} />
      </Watermark>
    );
  },
});
</script>
<style lang="less" scoped></style>
