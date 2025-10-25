<script lang="tsx">
import { Flex, Progress } from '@/components';

import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    return () => (
      <>
        <Flex vertical gap="middle">
          <Flex vertical gap="small" style={{ width: '300px' }}>
            <Progress percent={50} />
            <Progress percent={50} size="small" />
            <Progress percent={50} size={[300, 20]} />
          </Flex>
          <Flex align="center" wrap gap={30}>
            <Progress type="circle" percent={50} />
            <Progress type="circle" percent={50} size="small" />
            <Progress type="circle" percent={50} size={20} />
          </Flex>
          <Flex align="center" wrap gap={30}>
            <Progress type="dashboard" percent={50} />
            <Progress type="dashboard" percent={50} size="small" />
            <Progress type="dashboard" percent={50} size={20} />
          </Flex>
          <Flex align="center" wrap gap={30}>
            <Progress steps={3} percent={50} />
            <Progress steps={3} percent={50} size="small" />
            <Progress steps={3} percent={50} size={20} />
            <Progress steps={3} percent={50} size={[20, 30]} />
          </Flex>
        </Flex>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
