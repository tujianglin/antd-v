<script lang="tsx">
import { Flex, Progress } from '@/components';

import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    return () => (
      <Flex gap="small" vertical>
        <Progress percent={30} />
        <Progress percent={50} status="active" />
        <Progress percent={70} status="exception" />
        <Progress percent={100} />
        <Progress percent={50} showInfo={false} />
      </Flex>
    );
  },
});
</script>
<style lang="less" scoped></style>
