<script lang="tsx" setup>
import type { DateType } from '@/vc-util/type';
import { useTemplateRef } from 'vue';
import DatePicker from '../date-picker';
import type { TimeRangePickerProps } from './index.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { allowClear = true } = defineProps<TimeRangePickerProps>();

const value = defineModel<DateType[]>('value');
const pickerValue = defineModel<DateType[]>('pickerValue');
const open = defineModel<boolean>('open', { default: undefined });

const domRef = useTemplateRef('domRef');

defineExpose({
  get el() {
    return domRef.value;
  },
});

const { RangePicker: InternalRangePicker } = DatePicker;
</script>
<template>
  <InternalRangePicker
    ref="domRef"
    v-bind="{...$props as any}"
    v-model:value="value"
    v-model:picker-value="pickerValue"
    v-model:open="open"
    :allow-clear="allowClear"
    picker="time"
    :mode="undefined"
  />
</template>
