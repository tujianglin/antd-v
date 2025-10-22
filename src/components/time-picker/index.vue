<script lang="tsx" setup>
import type { DateType, VueNode } from '@/vc-util/type';
import { computed, useTemplateRef, type CSSProperties } from 'vue';
import type { InputStatus } from '../_util/statusUtils';
import DatePicker from '../date-picker';
import type {
  PickerClassNames as DatePickerClassNames,
  GenericTimePickerProps,
  PickerPropsWithMultiple,
  RangePickerProps,
} from '../date-picker/generatePicker/interface';
import useVariant from '../form/hooks/useVariants';

export type TimePickerClassNames = Omit<DatePickerClassNames, 'popup'> & {
  popup?: string | Omit<DatePickerClassNames['popup'], 'header' | 'body'>;
};

export type TimePickerStyles = Partial<Record<keyof Omit<TimePickerClassNames, 'popup'>, CSSProperties>> & {
  popup?: Partial<Record<keyof Exclude<TimePickerClassNames['popup'], string>, CSSProperties>>;
};

export type PickerTimeProps = PickerPropsWithMultiple<GenericTimePickerProps>;

export type RangePickerTimeProps = Omit<RangePickerProps, 'showTime' | 'picker'>;

export interface TimePickerLocale {
  placeholder?: string;
  rangePlaceholder?: [string, string];
}

export interface TimeRangePickerProps extends Omit<RangePickerTimeProps, 'picker'> {}

export interface TimePickerProps extends Omit<PickerTimeProps, 'picker' | 'classNames' | 'styles'> {
  addon?: () => VueNode;
  status?: InputStatus;
  rootClassName?: string;

  classNames?: TimePickerClassNames;
  styles?: TimePickerStyles;
}

defineOptions({ name: 'TimePicker', inheritAttrs: false, compatConfig: { MODE: 3 } });

const { addon, renderExtraFooter, variant, allowClear = true, ...restProps } = defineProps<TimePickerProps>();

const value = defineModel<DateType>('value');
const pickerValue = defineModel<DateType>('pickerValue');
const open = defineModel<boolean>('open');

const timePickerRef = useTemplateRef('timePickerRef');

defineExpose({
  get el() {
    return timePickerRef.value;
  },
});

const { TimePicker: InternalTimePicker } = DatePicker;

const [mergedVariant] = useVariant(
  'timePicker',
  computed(() => variant),
);

const internalRenderExtraFooter = computed(() => {
  if (renderExtraFooter) {
    return renderExtraFooter;
  }

  if (addon) {
    return addon;
  }
  return undefined;
});
</script>
<template>
  <InternalTimePicker
    ref="timePickerRef"
    v-bind="{...restProps as any}"
    v-model:value="value"
    v-model:picker-value="pickerValue"
    v-model:open="open"
    :allow-clear="allowClear"
    :mode="undefined"
    :render-extra-footer="internalRenderExtraFooter"
    :variant="mergedVariant"
  />
</template>
