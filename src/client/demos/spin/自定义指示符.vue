<script lang="tsx">
import { Flex, Spin } from '@/components';
import { LoadingOutlined } from '@ant-design/icons-vue';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <Flex align="center" gap="middle">
        <Spin indicator={<LoadingOutlined spin />} size="small" />
        <Spin indicator={<LoadingOutlined spin />} />
        <Spin indicator={<LoadingOutlined spin />} size="large" />
        <Spin indicator={<LoadingOutlined style={{ fontSize: '48px' }} spin />} />
      </Flex>
    );
  },
});
</script>
<style lang="less" scoped></style>
