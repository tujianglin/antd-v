<script lang="tsx">
import { Skeleton } from '@/components';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => <Skeleton avatar paragraph={{ rows: 4 }} />;
  },
});
</script>
<style lang="less" scoped></style>
