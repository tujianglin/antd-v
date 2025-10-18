<script lang="tsx" setup>
import { computed } from 'vue';
import Select from '../../select';
import type { SharedProps } from './index.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, fullscreen, validRange, value, generateConfig, locale, onChange, divRef } = defineProps<SharedProps>();
const month = computed(() => generateConfig.getMonth(value || generateConfig.getNow()));

const start = computed(() => {
  let result = 0;
  if (validRange) {
    const [rangeStart] = validRange;
    const currentYear = generateConfig.getYear(value);
    if (generateConfig.getYear(rangeStart) === currentYear) {
      result = generateConfig.getMonth(rangeStart);
    }
  }
  return result;
});

const end = computed(() => {
  let result = 11;
  if (validRange) {
    const [, rangeEnd] = validRange;
    const currentYear = generateConfig.getYear(value);
    if (generateConfig.getYear(rangeEnd) === currentYear) {
      result = generateConfig.getMonth(rangeEnd);
    }
  }
  return result;
});

const months = computed(() => locale.shortMonths || generateConfig.locale.getShortMonths!(locale.locale));
const options = computed(() => {
  const result: { label: string; value: number }[] = [];
  for (let index = start.value; index <= end.value; index += 1) {
    result.push({
      label: months.value[index],
      value: index,
    });
  }
  return result;
});
</script>
<template>
  <Select
    :size="fullscreen ? undefined : 'small'"
    :class="`${prefixCls}-month-select`"
    :value="month"
    :options="options"
    :allow-clear="false"
    @change="
      (newMonth) => {
        onChange(generateConfig.setMonth(value, newMonth));
      }
    "
    :get-popup-container="() => divRef!.value!"
  />
</template>
