import warning from '@/vc-util/warning';
import { reactiveComputed, type ReactiveComputedReturn } from '@vueuse/core';
import { computed, toRefs, type ComputedRef, type Ref } from 'vue';
import useLocale from '../../hooks/useLocale';
import { fillShowTimeConfig, getTimeProps } from '../../hooks/useTimeConfig';
import type { FormatType, InternalMode, PanelMode, PickerMode } from '../../interface';
import { toArray } from '../../utils/miscUtil';
import type { RangePickerProps } from '../RangePicker.vue';
import { fillClearIcon } from '../Selector/hooks/useClearIcon';
import useDisabledBoundary from './useDisabledBoundary';
import { useFieldFormat } from './useFieldFormat';
import useInputReadOnly from './useInputReadOnly';
import useInvalidate from './useInvalidate';

type UseInvalidate<DateType extends object = any> = typeof useInvalidate<DateType>;

type PickedProps<DateType extends object = any> = Pick<
  RangePickerProps<DateType>,
  | 'generateConfig'
  | 'locale'
  | 'picker'
  | 'prefixCls'
  | 'styles'
  | 'classNames'
  | 'order'
  | 'components'
  | 'allowClear'
  | 'needConfirm'
  | 'format'
  | 'inputReadOnly'
  | 'disabledDate'
  | 'minDate'
  | 'maxDate'
  | 'defaultOpenValue'
> & {
  multiple?: boolean;
  // RangePicker showTime definition is different with Picker
  showTime?: any;
  value?: any;
  defaultValue?: any;
  pickerValue?: any;
  defaultPickerValue?: any;
};

type ExcludeBooleanType<T> = T extends boolean ? never : T;

type GetGeneric<T> = T extends PickedProps<infer U> ? U : never;

type ToArrayType<T, DateType> = T extends any[] ? T : DateType[];

function useList<T>(value: T | T[], fillMode: boolean = false) {
  const list = value ? toArray(value) : value;

  if (fillMode && list) {
    list[1] = list[1] || list[0];
  }

  return list;
}

export type FilledProps<InProps extends PickedProps, DateType extends GetGeneric<InProps>, UpdaterProps extends object> = Omit<
  InProps,
  keyof UpdaterProps | 'showTime' | 'value' | 'defaultValue'
> &
  UpdaterProps & {
    picker: PickerMode;
    showTime?: ExcludeBooleanType<InProps['showTime']>;
    value?: ToArrayType<InProps['value'], DateType>;
    defaultValue?: ToArrayType<InProps['value'], DateType>;
    pickerValue?: ToArrayType<InProps['value'], DateType>;
    defaultPickerValue?: ToArrayType<InProps['value'], DateType>;
  };

/**
 * Align the outer props with unique typed and fill undefined props.
 * This is shared with both RangePicker and Picker. This will do:
 * - Convert `value` & `defaultValue` to array
 * - handle the legacy props fill like `clearIcon` + `allowClear` = `clearIcon`
 */
export default function useFilledProps<
  InProps extends PickedProps,
  DateType extends GetGeneric<InProps>,
  UpdaterProps extends object,
>(
  props: ReactiveComputedReturn<InProps>,
  updater?: () => UpdaterProps,
): [
  filledProps: ComputedRef<FilledProps<InProps, DateType, UpdaterProps>>,
  internalPicker: ComputedRef<InternalMode>,
  complexPicker: ComputedRef<boolean>,
  formatList: Ref<FormatType<any>[]>,
  maskFormat: Ref<string>,
  isInvalidateDate: ComputedRef<ReturnType<UseInvalidate<DateType>>>,
] {
  const {
    generateConfig,
    locale,
    picker,
    prefixCls,
    allowClear,
    needConfirm,
    multiple,
    format,
    inputReadOnly,
    disabledDate,
    minDate,
    maxDate,
    showTime,

    value,
    defaultValue,
    pickerValue,
    defaultPickerValue,
  } = toRefs(props);

  const values = computed(() => useList(value.value));
  const defaultValues = computed(() => useList(defaultValue.value));
  const pickerValues = computed(() => useList(pickerValue.value) || []);
  const defaultPickerValues = computed(() => useList(defaultPickerValue.value) || []);

  // ======================== Picker ========================
  /** Almost same as `picker`, but add `datetime` for `date` with `showTime` */
  const internalPicker = computed(() => (picker.value === 'date' && showTime.value ? 'datetime' : picker.value) as InternalMode);

  /** The picker is `datetime` or `time` */
  const multipleInteractivePicker = computed(() => internalPicker.value === 'time' || internalPicker.value === 'datetime');
  const complexPicker = computed(() => multipleInteractivePicker.value || multiple?.value);
  const mergedNeedConfirm = computed(() => (needConfirm.value === true ? needConfirm.value : multipleInteractivePicker.value));

  // ========================== Time ==========================
  // Auto `format` need to check `showTime.showXXX` first.
  // And then merge the `locale` into `mergedShowTime`.
  const { timeProps, localeTimeProps, showTimeFormat, propFormat } = toRefs(reactiveComputed(() => getTimeProps(props)));

  // ======================= Locales ========================
  const mergedLocale = computed(() => useLocale(locale.value, localeTimeProps.value));

  const mergedShowTime = computed(() => {
    return fillShowTimeConfig(internalPicker.value, showTimeFormat.value, propFormat.value, timeProps.value, mergedLocale.value);
  });

  // ======================= Warning ========================
  if (process.env.NODE_ENV !== 'production' && picker.value === 'time') {
    if (['disabledHours', 'disabledMinutes', 'disabledSeconds'].some((key) => (props as any)[key])) {
      warning(
        false,
        `'disabledHours', 'disabledMinutes', 'disabledSeconds' will be removed in the next major version, please use 'disabledTime' instead.`,
      );
    }
  }
  // ======================== Props =========================
  const filledProps = computed(() => {
    return {
      ...props,
      locale: mergedLocale.value,
      clearIcon: fillClearIcon(prefixCls.value, allowClear.value),
      showTime: mergedShowTime.value,
      value: values.value,
      defaultValue: defaultValues.value,
      pickerValue: pickerValues.value,
      defaultPickerValue: defaultPickerValues.value,
      ...updater?.(),
    };
  });

  // ======================== Format ========================
  const { formatList, maskFormat } = toRefs(
    reactiveComputed(() => useFieldFormat<DateType>(internalPicker.value, mergedLocale.value, format.value)),
  );

  // ======================= ReadOnly =======================
  const mergedInputReadOnly = computed(() => useInputReadOnly(formatList.value, inputReadOnly.value, multiple?.value));

  // ======================= Boundary =======================
  const disabledBoundaryDate = computed(() =>
    useDisabledBoundary(generateConfig.value, locale.value, disabledDate.value, minDate.value, maxDate.value),
  );

  // ====================== Invalidate ======================
  const isInvalidateDate = computed(() =>
    useInvalidate(generateConfig.value, picker.value as PanelMode, disabledBoundaryDate.value, mergedShowTime.value),
  );

  // ======================== Merged ========================
  const mergedProps = computed<any>(() => ({
    ...filledProps.value,
    needConfirm: mergedNeedConfirm.value,
    inputReadOnly: mergedInputReadOnly.value,
    disabledDate: disabledBoundaryDate.value,
  }));

  return [mergedProps, internalPicker, complexPicker, formatList, maskFormat, isInvalidateDate];
}
