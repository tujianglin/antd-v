<script lang="tsx">
import { Flex, Spin, Switch } from '@/components';
import { computed, defineComponent, onBeforeUnmount, ref, watch } from 'vue';

export default defineComponent({
  setup() {
    const auto = ref(false);
    const percent = ref(-50);
    const timerRef = ref<ReturnType<typeof setTimeout>>(null);

    watch(
      percent,
      () => {
        timerRef.value = setTimeout(() => {
          const nextPercent = percent.value + 5;
          percent.value = nextPercent > 150 ? -50 : nextPercent;
        }, 100);
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      clearTimeout(timerRef.value!);
    });

    const mergedPercent = computed(() => (auto.value ? 'auto' : percent.value));

    return () => (
      <Flex align="center" gap="middle">
        <Switch
          checkedChildren="Auto"
          unCheckedChildren="Auto"
          v-model:checked={auto.value}
          onChange={() => {
            percent.value = percent.value - 50;
          }}
        />
        <Spin percent={mergedPercent.value} size="small" />
        <Spin percent={mergedPercent.value} />
        <Spin percent={mergedPercent.value} size="large" />
      </Flex>
    );
  },
});
</script>
<style lang="less" scoped></style>
