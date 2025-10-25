<script lang="tsx">
import { Button, Flex, Progress, Space } from '@/components';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons-vue';

import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {
    const percent = ref<number>(0);

    const increase = () => {
      const newPercent = percent.value + 10;
      if (newPercent > 100) {
        percent.value = 100;
      } else {
        percent.value = newPercent;
      }
    };

    const decline = () => {
      const newPercent = percent.value - 10;
      if (newPercent < 0) {
        percent.value = 0;
      } else {
        percent.value = newPercent;
      }
    };
    return () => (
      <Flex vertical gap="small">
        <Flex vertical gap="small">
          <Progress percent={percent.value} type="line" />
          <Progress percent={percent.value} type="circle" />
        </Flex>
        <Space.Compact>
          <Button onClick={decline} icon={<MinusOutlined />} />
          <Button onClick={increase} icon={<PlusOutlined />} />
        </Space.Compact>
      </Flex>
    );
  },
});
</script>
<style lang="less" scoped></style>
