<script lang="tsx">
import { Flex, Progress } from '@/components';

import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    return () => (
      <Flex gap="small" wrap>
        <Progress type="circle" percent={75} />
        <Progress type="circle" percent={70} status="exception" />
        <Progress type="circle" percent={100} />
      </Flex>
    );
  },
});
</script>
<style lang="less" scoped></style>
