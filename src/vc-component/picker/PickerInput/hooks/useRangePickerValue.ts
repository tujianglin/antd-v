import useMergedState from '@/vc-util/hooks/useMergedState';
import { computed, nextTick, ref, watch, type Ref } from 'vue';
import type { GenerateConfig } from '../../generate';
import type { InternalMode, Locale, PanelMode } from '../../interface';
import { fillTime, isSame } from '../../utils/dateUtil';
import type { RangePickerProps } from '../RangePicker.vue';

export function offsetPanelDate<DateType = any>(
  generateConfig: GenerateConfig<DateType>,
  picker: InternalMode,
  date: DateType,
  offset: number,
) {
  switch (picker) {
    case 'date':
    case 'week':
      return generateConfig.addMonth(date, offset);

    case 'month':
    case 'quarter':
      return generateConfig.addYear(date, offset);

    case 'year':
      return generateConfig.addYear(date, offset * 10);

    case 'decade':
      return generateConfig.addYear(date, offset * 100);

    default:
      return date;
  }
}

const EMPTY_LIST: any = [];

export default function useRangePickerValue<DateType extends object, ValueType extends DateType[]>(
  generateConfig: Ref<GenerateConfig<DateType>>,
  locale: Ref<Locale>,
  calendarValue: Ref<ValueType>,
  modes: Ref<PanelMode[]>,
  open: Ref<boolean>,
  activeIndex: Ref<number>,
  pickerMode: Ref<InternalMode>,
  multiplePanel: Ref<boolean>,
  defaultPickerValue: Ref<ValueType> = ref(EMPTY_LIST),
  pickerValue: Ref<ValueType> = ref(EMPTY_LIST),
  // This is legacy from origin logic.
  // We will take `showTime.defaultValue` as the part of `pickerValue`
  timeDefaultValue: Ref<ValueType> = ref(EMPTY_LIST),
  onPickerValueChange?: RangePickerProps<DateType>['onPickerValueChange'],
  minDate?: Ref<DateType>,
  maxDate?: Ref<DateType>,
): [currentIndexPickerValue: Ref<DateType>, setCurrentIndexPickerValue: (value: DateType) => void] {
  const isTimePicker = computed(() => pickerMode.value === 'time');

  // ======================== Active ========================
  // `activeIndex` must be valid to avoid getting empty `pickerValue`
  const mergedActiveIndex = computed(() => activeIndex.value || 0);

  // ===================== Picker Value =====================
  const getDefaultPickerValue = (index: number) => {
    let now = generateConfig.value.getNow();
    if (isTimePicker) {
      now = fillTime(generateConfig.value, now);
    }
    return defaultPickerValue.value[index] || calendarValue.value[index] || now;
  };

  // Align `pickerValue` with `showTime.defaultValue`
  const startPickerValue = computed(() => pickerValue.value?.[0]);
  const endPickerValue = computed(() => pickerValue.value?.[1]);
  // PickerValue state
  const [mergedStartPickerValue, setStartPickerValue] = useMergedState(() => getDefaultPickerValue(0), {
    value: startPickerValue,
  });

  const [mergedEndPickerValue, setEndPickerValue] = useMergedState(() => getDefaultPickerValue(1), {
    value: endPickerValue,
  });

  // Current PickerValue
  const currentPickerValue = computed(() => {
    const current = [mergedStartPickerValue.value, mergedEndPickerValue.value][mergedActiveIndex.value];
    // Merge the `showTime.defaultValue` into `pickerValue`
    return isTimePicker.value
      ? current
      : fillTime(generateConfig.value, current, timeDefaultValue?.value?.[mergedActiveIndex.value]);
  });

  const setCurrentPickerValue = (nextPickerValue: DateType, source: 'reset' | 'panel' = 'panel') => {
    const updater = [setStartPickerValue, setEndPickerValue][mergedActiveIndex.value];
    updater(nextPickerValue);

    const clone: [DateType, DateType] = [mergedStartPickerValue.value, mergedEndPickerValue.value];
    clone[mergedActiveIndex.value] = nextPickerValue;

    if (
      onPickerValueChange &&
      (!isSame(generateConfig.value, locale.value, mergedStartPickerValue.value, clone[0], pickerMode.value) ||
        !isSame(generateConfig.value, locale.value, mergedEndPickerValue.value, clone[1], pickerMode.value))
    ) {
      onPickerValueChange(clone, {
        source,
        range: mergedActiveIndex.value === 1 ? 'end' : 'start',
        mode: modes.value as any,
      });
    }
  };

  // ======================== Effect ========================
  /**
   * EndDate pickerValue is little different. It should be:
   * - If date picker (without time), endDate is not same year & month as startDate
   *   - pickerValue minus one month
   * - Else pass directly
   */
  const getEndDatePickerValue = (startDate: DateType, endDate: DateType) => {
    if (multiplePanel.value) {
      // Basic offset
      const SAME_CHECKER: Partial<Record<InternalMode, PanelMode>> = {
        date: 'month',
        week: 'month',
        month: 'year',
        quarter: 'year',
      };

      const mode = SAME_CHECKER[pickerMode.value];
      if (mode && !isSame(generateConfig.value, locale.value, startDate, endDate, mode)) {
        return offsetPanelDate(generateConfig.value, pickerMode.value, endDate, -1);
      }

      // Year offset
      if (pickerMode.value === 'year' && startDate) {
        const srcYear = Math.floor(generateConfig.value.getYear(startDate) / 10);
        const tgtYear = Math.floor(generateConfig.value.getYear(endDate) / 10);
        if (srcYear !== tgtYear) {
          return offsetPanelDate(generateConfig.value, pickerMode.value, endDate, -1);
        }
      }
    }

    return endDate;
  };

  // >>> When switch field, reset the picker value as prev field picker value
  const prevActiveIndexRef = ref<number>(null);
  watch(
    [open, mergedActiveIndex, () => calendarValue.value[mergedActiveIndex.value]],
    async () => {
      await nextTick();
      if (open.value) {
        if (!defaultPickerValue.value[mergedActiveIndex.value]) {
          let nextPickerValue: DateType = isTimePicker.value ? null : generateConfig.value.getNow();

          /**
           * 1. If has prevActiveIndex, use it to avoid panel jump
           * 2. If current field has value
           *    - If `activeIndex` is 1 and `calendarValue[0]` is not same panel as `calendarValue[1]`,
           *      offset `calendarValue[1]` and set it
           *    - Else use `calendarValue[activeIndex]`
           * 3. If current field has no value but another field has value, use another field value
           * 4. Else use now (not any `calendarValue` can ref)
           */

          if (prevActiveIndexRef.value !== null && prevActiveIndexRef.value !== mergedActiveIndex.value) {
            // If from another field, not jump picker value
            nextPickerValue = [mergedStartPickerValue.value, mergedEndPickerValue.value][mergedActiveIndex.value ^ 1];
          } else if (calendarValue.value[mergedActiveIndex.value]) {
            // Current field has value
            nextPickerValue =
              mergedActiveIndex.value === 0
                ? calendarValue.value[0]
                : getEndDatePickerValue(calendarValue.value[0], calendarValue.value[1]);
          } else if (calendarValue.value[mergedActiveIndex.value ^ 1]) {
            // Current field has no value but another field has value
            nextPickerValue = calendarValue.value[mergedActiveIndex.value ^ 1];
          }

          // Only sync when has value, this will sync in the `min-max` logic
          if (nextPickerValue) {
            // nextPickerValue < minDate
            if (minDate.value && generateConfig.value.isAfter(minDate.value, nextPickerValue)) {
              nextPickerValue = minDate.value;
            }

            // maxDate < nextPickerValue
            const offsetPickerValue = multiplePanel.value
              ? offsetPanelDate(generateConfig.value, pickerMode.value, nextPickerValue, 1)
              : nextPickerValue;
            if (maxDate.value && generateConfig.value.isAfter(offsetPickerValue, maxDate.value)) {
              nextPickerValue = multiplePanel.value
                ? offsetPanelDate(generateConfig.value, pickerMode.value, maxDate.value, -1)
                : maxDate.value;
            }

            setCurrentPickerValue(nextPickerValue, 'reset');
          }
        }
      }
    },
    { immediate: true, deep: true, flush: 'post' },
  );

  // >>> Reset prevActiveIndex when panel closed
  watch(
    [open, mergedActiveIndex],
    () => {
      if (open.value) {
        prevActiveIndexRef.value = mergedActiveIndex.value;
      } else {
        prevActiveIndexRef.value = null;
      }
    },
    { immediate: true },
  );

  // >>> defaultPickerValue: Resync to `defaultPickerValue` for each panel focused
  watch(
    [open, mergedActiveIndex],
    async () => {
      await nextTick();
      if (open.value && defaultPickerValue.value) {
        if (defaultPickerValue.value[mergedActiveIndex.value]) {
          setCurrentPickerValue(defaultPickerValue.value[mergedActiveIndex.value], 'reset');
        }
      }
    },
    { immediate: true, flush: 'post' },
  );

  return [currentPickerValue, setCurrentPickerValue];
}
