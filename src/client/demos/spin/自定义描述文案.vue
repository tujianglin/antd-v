<script lang="tsx">
import { Alert, Flex, Spin } from '@/components';
import { defineComponent, type CSSProperties } from 'vue';

const contentStyle: CSSProperties = {
  padding: '50px',
  background: 'rgba(0, 0, 0, 0.05)',
  borderRadius: '4px',
};

const content = <div style={contentStyle} />;

export default defineComponent({
  setup() {
    return () => (
      <Flex gap="middle" vertical>
        <Flex gap="middle">
          <Spin tip="Loading" size="small">
            {content}
          </Spin>
          <Spin tip="Loading">{content}</Spin>
          <Spin tip="Loading" size="large">
            {content}
          </Spin>
        </Flex>
        <Spin tip="Loading...">
          <Alert title="Alert message title" description="Further details about the context of this alert." type="info" />
        </Spin>
      </Flex>
    );
  },
});
</script>
<style lang="less" scoped></style>
