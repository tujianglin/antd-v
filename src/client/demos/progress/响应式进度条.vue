<script lang="tsx">
import { Flex, Progress } from '@/components';

import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    return () => (
      <Flex align="center" gap="small">
        <Progress
          type="circle"
          railColor="#e6f4ff"
          percent={60}
          strokeWidth={20}
          size={14}
          format={(number) => `进行中，已完成${number}%`}
        />
        <span>代码发布</span>
      </Flex>
    );
  },
});
</script>
<style lang="less" scoped></style>
