<script lang="tsx" setup>
import { omit } from 'es-toolkit/compat';
import { computed } from 'vue';
import useTimeInfo from '../../hooks/useTimeInfo';
import type { SharedPanelProps } from '../../interface';
import { fillTime } from '../../utils/dateUtil';
import DatePanel from '../DatePanel/index.vue';
import TimePanel from '../TimePanel/index.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, generateConfig, showTime, onSelect, value, pickerValue, onHover } = defineProps<SharedPanelProps>();

const panelPrefixCls = computed(() => `${prefixCls}-datetime-panel`);

// =============================== Time ===============================
const [getValidTime] = useTimeInfo(
  computed(() => generateConfig),
  computed(() => showTime),
);

// Merge the time info from `value` or `pickerValue`
const mergeTime = (date) => {
  if (value) {
    return fillTime(generateConfig, date, value);
  }

  return fillTime(generateConfig, date, pickerValue);
};

// ============================== Hover ===============================
const onDateHover = (date) => {
  onHover?.(date ? mergeTime(date) : date);
};

// ============================== Select ==============================
const onDateSelect = (date) => {
  // Merge with current time
  const cloneDate = mergeTime(date);

  onSelect(getValidTime(cloneDate, cloneDate));
};
</script>
<template>
  <div :class="panelPrefixCls">
    <DatePanel v-bind="omit($props, ['onSelect', 'onHover'])" @select="onDateSelect" @hover="onDateHover" />
    <TimePanel v-bind="$props" />
  </div>
</template>
