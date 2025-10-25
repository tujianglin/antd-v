<script lang="tsx">
import { Flex, Progress, Slider } from '@/components';

import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {
    const stepsCount = ref<number>(5);
    const stepsGap = ref<number>(7);

    return () => (
      <>
        <Slider min={2} max={10} v-model:value={stepsCount.value} />
        <Slider step={4} min={0} max={40} v-model:value={stepsGap.value} />
        <Flex wrap gap="middle" style={{ marginTop: '16px' }}>
          <Progress type="dashboard" steps={8} percent={50} railColor="rgba(0, 0, 0, 0.06)" strokeWidth={20} />
          <Progress
            type="circle"
            percent={100}
            steps={{ count: stepsCount.value, gap: stepsGap.value }}
            railColor="rgba(0, 0, 0, 0.06)"
            strokeWidth={20}
          />
        </Flex>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
