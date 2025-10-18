<script lang="tsx" setup>
import { computed } from 'vue';
import Select from '../../select';
import type { SharedProps } from './index.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { fullscreen, validRange, generateConfig, locale, prefixCls, value, onChange, divRef } = defineProps<SharedProps>();

const YEAR_SELECT_OFFSET = 10;
const YEAR_SELECT_TOTAL = 20;

const year = computed(() => generateConfig.getYear(value || generateConfig.getNow()));

const start = computed(() => {
  let result = year.value - YEAR_SELECT_OFFSET;
  if (validRange) {
    result = generateConfig.getYear(validRange[0]);
  }
  return result;
});

const end = computed(() => {
  let result = start.value + YEAR_SELECT_TOTAL;
  if (validRange) {
    result = generateConfig.getYear(validRange[1]) + 1;
  }
  return result;
});

const suffix = computed(() => (locale && locale.year === '年' ? '年' : ''));

const options = computed(() => {
  const result: { label: string; value: number }[] = [];
  for (let index = start.value; index < end.value; index++) {
    result.push({ label: `${index}${suffix.value}`, value: index });
  }
  return result;
});
</script>
<template>
  <Select
    :size="fullscreen ? undefined : 'small'"
    :options="options"
    :value="year"
    :allow-clear="false"
    :class="`${prefixCls}-year-select`"
    @change="
      (numYear) => {
        let newDate = generateConfig.setYear(value, numYear);

        if (validRange) {
          const [startDate, endDate] = validRange;
          const newYear = generateConfig.getYear(newDate);
          const newMonth = generateConfig.getMonth(newDate);
          if (newYear === generateConfig.getYear(endDate) && newMonth > generateConfig.getMonth(endDate)) {
            newDate = generateConfig.setMonth(newDate, generateConfig.getMonth(endDate));
          }
          if (newYear === generateConfig.getYear(startDate) && newMonth < generateConfig.getMonth(startDate)) {
            newDate = generateConfig.setMonth(newDate, generateConfig.getMonth(startDate));
          }
        }

        onChange(newDate);
      }
    "
    :get-popup-container="() => divRef!.value!"
  />
</template>
