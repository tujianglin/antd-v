<script lang="tsx">
import { Flex, Spin } from '@/components';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <Flex align="center" gap="middle">
        <Spin size="small" />
        <Spin />
        <Spin size="large" />
      </Flex>
    );
  },
});
</script>
<style lang="less" scoped></style>
