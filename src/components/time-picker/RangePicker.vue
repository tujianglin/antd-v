<script lang="tsx" setup>
import { useTemplateRef } from 'vue';
import DatePicker from '../date-picker';
import type { TimeRangePickerProps } from './index.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const props = withDefaults(defineProps<TimeRangePickerProps>(), {
  showHour: true,
  showMinute: true,
  showSecond: true,
  showNow: true,
});

const domRef = useTemplateRef('domRef');

defineExpose({
  ...domRef.value,
});

const { RangePicker: InternalRangePicker } = DatePicker;
</script>
<template>
  <InternalRangePicker ref="domRef" v-bind="props" picker="time" :mode="undefined" />
</template>
