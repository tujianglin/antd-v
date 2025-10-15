<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import type { Dayjs } from 'dayjs';
import { computed, useTemplateRef, type CSSProperties } from 'vue';
import type { InputStatus } from '../_util/statusUtils';
import type { AnyObject } from '../_util/type';
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

export type PickerTimeProps<DateType extends AnyObject> = PickerPropsWithMultiple<DateType, GenericTimePickerProps<DateType>>;

export type RangePickerTimeProps<DateType extends AnyObject> = Omit<RangePickerProps<DateType>, 'showTime' | 'picker'>;

export interface TimePickerLocale {
  placeholder?: string;
  rangePlaceholder?: [string, string];
}

export interface TimeRangePickerProps extends Omit<RangePickerTimeProps<Dayjs>, 'picker'> {}

export interface TimePickerProps extends Omit<PickerTimeProps<Dayjs>, 'picker' | 'classNames' | 'styles'> {
  addon?: () => VueNode;
  status?: InputStatus;
  rootClassName?: string;

  classNames?: TimePickerClassNames;
  styles?: TimePickerStyles;
}

defineOptions({ name: 'TimePicker', inheritAttrs: false, compatConfig: { MODE: 3 } });

const { addon, renderExtraFooter, variant, allowClear = true, ...restProps } = defineProps<TimePickerProps>();

const value = defineModel<any>('value');
const pickerValue = defineModel<any>('pickerValue');
const open = defineModel<boolean>('open');

const timePickerRef = useTemplateRef('timePickerRef');

defineExpose({
  ...timePickerRef.value,
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
