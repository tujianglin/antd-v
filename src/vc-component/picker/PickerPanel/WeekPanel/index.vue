<script lang="tsx" setup>
import clsx from 'clsx';
import { computed } from 'vue';
import type { SharedPanelProps } from '../../interface';
import { isInRange, isSameWeek } from '../../utils/dateUtil';
import DatePanel from '../DatePanel/index.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, generateConfig, locale, value, hoverValue, hoverRangeValue } = defineProps<SharedPanelProps>();

// =============================== Row ================================
const localeName = computed(() => locale.locale);

const rowPrefixCls = computed(() => `${prefixCls}-week-panel-row`);

const rowClassName = (currentDate) => {
  const rangeCls = {};

  if (hoverRangeValue) {
    const [rangeStart, rangeEnd] = hoverRangeValue;

    const isRangeStart = isSameWeek(generateConfig, localeName.value, rangeStart, currentDate);
    const isRangeEnd = isSameWeek(generateConfig, localeName.value, rangeEnd, currentDate);

    rangeCls[`${rowPrefixCls.value}-range-start`] = isRangeStart;
    rangeCls[`${rowPrefixCls.value}-range-end`] = isRangeEnd;
    rangeCls[`${rowPrefixCls.value}-range-hover`] =
      !isRangeStart && !isRangeEnd && isInRange(generateConfig, rangeStart, rangeEnd, currentDate);
  }

  if (hoverValue) {
    rangeCls[`${rowPrefixCls.value}-hover`] = hoverValue.some((date) =>
      isSameWeek(generateConfig, localeName.value, currentDate, date),
    );
  }

  return clsx(
    rowPrefixCls.value,
    {
      [`${rowPrefixCls.value}-selected`]: !hoverRangeValue && isSameWeek(generateConfig, localeName.value, value, currentDate),
    },

    // Patch for hover range
    rangeCls,
  );
};
</script>
<template>
  <DatePanel v-bind="$props" mode="week" panel-name="week" :row-class-name="rowClassName" />
</template>
