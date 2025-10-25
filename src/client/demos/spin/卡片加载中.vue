<script lang="tsx">
import { Alert, Flex, Spin, Switch } from '@/components';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const loading = ref(false);
    return () => (
      <Flex gap="middle" vertical>
        <Spin spinning={loading.value}>
          <Alert type="info" title="Alert message title" description="Further details about the context of this alert." />
        </Spin>
        <p>
          Loading state：
          <Switch v-model:checked={loading.value} />
        </p>
      </Flex>
    );
  },
});
</script>
<style lang="less" scoped></style>
