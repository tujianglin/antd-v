import type { DateType } from '@/vc-util/type';
import warning from '@/vc-util/warning';
import { reactiveComputed, type ReactiveComputedReturn } from '@vueuse/core';
import { computed, ref, toRefs, type ComputedRef, type Ref } from 'vue';
import useLocale from '../../hooks/useLocale';
import { fillShowTimeConfig, getTimeProps } from '../../hooks/useTimeConfig';
import type { FormatType, InternalMode, PickerMode } from '../../interface';
import { toArray } from '../../utils/miscUtil';
import type { RangePickerProps } from '../RangePicker.vue';
import { fillClearIcon } from '../Selector/hooks/useClearIcon';
import useDisabledBoundary from './useDisabledBoundary';
import { useFieldFormat } from './useFieldFormat';
import useInputReadOnly from './useInputReadOnly';
import useInvalidate from './useInvalidate';

type UseInvalidate = typeof useInvalidate;

type PickedProps = Pick<
  RangePickerProps,
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
};

type ExcludeBooleanType<T> = T extends boolean ? never : T;

type GetGeneric<T> = T extends PickedProps ? DateType : never;

type ToArrayType<T> = T extends any[] ? T : DateType[];

function useList<T>(value: Ref<T | T[]>, fillMode: Ref<boolean> = ref(false)) {
  return computed(() => {
    const list = value.value ? toArray(value.value) : value.value;

    if (fillMode?.value && list) {
      list[1] = list[1] || list[0];
    }

    return list;
  });
}

export type FilledProps<InProps extends PickedProps, DateType extends GetGeneric<InProps>, UpdaterProps extends object> = Omit<
  InProps,
  keyof UpdaterProps | 'showTime' | 'value' | 'defaultValue'
> &
  UpdaterProps & {
    picker: PickerMode;
    showTime?: ExcludeBooleanType<InProps['showTime']>;
    value?: ToArrayType<DateType | DateType[]>;
    pickerValue?: ToArrayType<DateType | DateType[]>;
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
  value?: Ref<any>,
  pickerValue?: Ref<any>,
  updater?: () => UpdaterProps,
): [
  filledProps: ComputedRef<FilledProps<InProps, DateType, UpdaterProps>>,
  internalPicker: ComputedRef<InternalMode>,
  complexPicker: ComputedRef<boolean>,
  formatList: Ref<FormatType[]>,
  maskFormat: Ref<string>,
  isInvalidateDate: ReturnType<UseInvalidate>,
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
  } = toRefs(props);

  const values = useList(value);
  const pickerValues = useList(pickerValue);

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
  const mergedLocale = useLocale(locale, localeTimeProps);

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
      pickerValue: pickerValues.value,
      ...updater?.(),
    };
  });

  // ======================== Format ========================
  const [formatList, maskFormat] = useFieldFormat(internalPicker, mergedLocale, format);

  // ======================= ReadOnly =======================
  const mergedInputReadOnly = useInputReadOnly(formatList, inputReadOnly, multiple);

  // ======================= Boundary =======================
  const disabledBoundaryDate = useDisabledBoundary(generateConfig, locale, disabledDate, minDate, maxDate);

  // ====================== Invalidate ======================
  const isInvalidateDate = useInvalidate(generateConfig, picker, disabledBoundaryDate, mergedShowTime);

  // ======================== Merged ========================
  const mergedProps = computed<any>(() => ({
    ...filledProps.value,
    needConfirm: mergedNeedConfirm.value,
    inputReadOnly: mergedInputReadOnly.value,
    disabledDate: disabledBoundaryDate,
  }));

  return [mergedProps, internalPicker, complexPicker, formatList, maskFormat, isInvalidateDate];
}
