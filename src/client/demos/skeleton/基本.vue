<script lang="tsx">
import { Skeleton } from '@/components';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => <Skeleton />;
  },
});
</script>
<style lang="less" scoped></style>
