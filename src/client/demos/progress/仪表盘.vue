<script lang="tsx">
import { Flex, Progress, Segmented } from '@/components';
import type { GapPlacement } from '@/components/progress/progress.vue';

import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {
    const gapPlacement = ref<GapPlacement>('bottom');
    const gapDegree = ref<number>(50);

    return () => (
      <Flex vertical gap="large">
        <div>
          gapDegree:
          <Segmented
            options={[
              { label: 50, value: 50 },

              { label: 100, value: 100 },
            ]}
            v-model:value={gapDegree.value}
          />
        </div>
        <div>
          gapPlacement:
          <Segmented
            options={[
              { label: 'start', value: 'start' },
              { label: 'end', value: 'end' },
              { label: 'top', value: 'top' },
              { label: 'bottom', value: 'bottom' },
            ]}
            v-model:value={gapPlacement.value}
          />
        </div>
        <Progress type="dashboard" gapDegree={gapDegree.value} percent={30} gapPlacement={gapPlacement.value} />
      </Flex>
    );
  },
});
</script>
<style lang="less" scoped></style>
