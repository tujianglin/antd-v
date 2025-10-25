<script lang="tsx">
import { Flex, Progress, Tooltip } from '@/components';

import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    return () => (
      <Flex gap="small" vertical>
        <Tooltip title="3 done / 3 in progress / 4 to do">
          <Progress percent={60} success={{ percent: 30 }} />
        </Tooltip>
        <Flex gap="small" wrap>
          <Tooltip title="3 done / 3 in progress / 4 to do">
            <Progress percent={60} success={{ percent: 30 }} type="circle" />
          </Tooltip>
          <Tooltip title="3 done / 3 in progress / 4 to do">
            <Progress percent={60} success={{ percent: 30 }} type="dashboard" />
          </Tooltip>
        </Flex>
      </Flex>
    );
  },
});
</script>
<style lang="less" scoped></style>
