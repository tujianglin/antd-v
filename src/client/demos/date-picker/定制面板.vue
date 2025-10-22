<script lang="tsx" setup>
import { Button, DatePicker, Flex, Slider, Space } from '@/components';
import type { SharedPanelProps } from '@/components/date-picker/interface';
import { reactiveComputed } from '@vueuse/core';
import dayjs from 'dayjs';
import { computed, defineComponent, ref, toRefs, watch } from 'vue';

const dateValue = ref();

const MyDatePanel = defineComponent({
  setup(_, { attrs }) {
    const { value, onSelect, onHover } = toRefs(reactiveComputed(() => attrs as unknown as SharedPanelProps));

    const startDate = dayjs().date(1).month(0);
    const innerValue = ref(value.value || startDate);

    watch(value, () => {
      if (value.value) {
        innerValue.value = value.value;
      }
    });

    // Range
    const dateCount = computed(() => {
      const endDate = startDate.add(1, 'year').add(-1, 'day');
      return endDate.diff(startDate, 'day');
    });

    const sliderValue = computed(() => Math.min(Math.max(0, innerValue.value.diff(startDate, 'day')), dateCount.value));

    return () => (
      <Flex vertical gap="small" style={{ padding: 'px' }}>
        <Slider
          class="w-full"
          min={0}
          max={dateCount.value}
          value={sliderValue.value}
          onChange={(nextValue) => {
            const nextDate = startDate.add(nextValue as number, 'day');
            innerValue.value = nextDate;
            onHover?.value?.(nextDate);
          }}
          tooltip={{
            formatter: (nextValue) => startDate.add(nextValue || 0, 'day').format('YYYY-MM-DD'),
          }}
        />
        <Button
          type="primary"
          onClick={() => {
            onSelect?.value?.(innerValue.value);
          }}
        >{`That's It!`}</Button>
      </Flex>
    );
  },
});
</script>
<template>
  <Space orientation="vertical">
    <DatePicker v-model:value="dateValue" :show-now="false" :components="{ date: MyDatePanel }" />
  </Space>
</template>
