<script lang="tsx">
import { Flex, Progress } from '@/components';

import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    return () => (
      <Flex gap="small" vertical>
        <Progress percent={0} percentPosition={{ align: 'center', type: 'inner' }} size={[200, 20]} strokeColor="#E6F4FF" />
        <Progress percent={10} percentPosition={{ align: 'center', type: 'inner' }} size={[300, 20]} />
        <Progress percent={50} percentPosition={{ align: 'start', type: 'inner' }} size={[300, 20]} strokeColor="#B7EB8F" />
        <Progress percent={60} percentPosition={{ align: 'end', type: 'inner' }} size={[300, 20]} strokeColor="#001342" />
        <Progress percent={100} percentPosition={{ align: 'center', type: 'inner' }} size={[400, 20]} />
        <Progress percent={60} percentPosition={{ align: 'start', type: 'outer' }} />
        <Progress percent={100} percentPosition={{ align: 'start', type: 'outer' }} />
        <Progress percent={60} percentPosition={{ align: 'center', type: 'outer' }} size="small" />
        <Progress percent={100} percentPosition={{ align: 'center', type: 'outer' }} />
      </Flex>
    );
  },
});
</script>
<style lang="less" scoped></style>
