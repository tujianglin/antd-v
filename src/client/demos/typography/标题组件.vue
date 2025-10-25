<script lang="tsx">
import { Typography } from '@/components';
import { defineComponent } from 'vue';

const { Title } = Typography;
export default defineComponent({
  setup() {
    return () => (
      <>
        <Title>h1. Ant Design</Title>
        <Title level={2}>h2. Ant Design</Title>
        <Title level={3}>h3. Ant Design</Title>
        <Title level={4}>h4. Ant Design</Title>
        <Title level={5}>h5. Ant Design</Title>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
