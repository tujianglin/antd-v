import warning from '@/vc-util/warning';
import { reactiveComputed } from '@vueuse/core';
import { computed, toRefs, type Ref } from 'vue';
import type { GenerateConfig } from '../generate';
import type { DisabledTimes, SharedTimeProps } from '../interface';
import { findValidateTime } from '../PickerPanel/TimePanel/TimePanelBody/util';
import { leftPad } from '../utils/miscUtil';

export type Unit<ValueType = number | string> = {
  label: any;
  value: ValueType;
  disabled?: boolean;
};

function emptyDisabled<T>(): T[] {
  return [];
}

function generateUnits(start: number, end: number, step = 1, hideDisabledOptions = false, disabledUnits: number[] = [], pad = 2) {
  const units: Unit<number>[] = [];
  const integerStep = step >= 1 ? step | 0 : 1;
  for (let i = start; i <= end; i += integerStep) {
    const disabled = disabledUnits.includes(i);

    if (!disabled || !hideDisabledOptions) {
      units.push({
        label: leftPad(i, pad),
        value: i,
        disabled,
      });
    }
  }
  return units;
}

/**
 * Parse time props to get util info
 */
export default function useTimeInfo<DateType extends object = any>(
  generateConfig: Ref<GenerateConfig<DateType>>,
  props: Ref<SharedTimeProps<DateType>>,
  date?: Ref<DateType>,
) {
  const use12Hours = computed(() => props?.value?.use12Hours);
  const hourStep = computed(() => props?.value?.hourStep || 1);
  const minuteStep = computed(() => props?.value?.minuteStep || 1);
  const secondStep = computed(() => props?.value?.secondStep || 1);
  const millisecondStep = computed(() => props?.value?.millisecondStep || 100);
  const hideDisabledOptions = computed(() => props?.value?.hideDisabledOptions);
  const disabledTime = computed(() => props?.value?.disabledTime);

  const mergedDate = computed(() => date?.value || generateConfig?.value?.getNow());

  // ======================== Warnings ========================
  if (process.env.NODE_ENV !== 'production') {
    const isHourStepValid = 24 % hourStep.value === 0;
    const isMinuteStepValid = 60 % minuteStep.value === 0;
    const isSecondStepValid = 60 % secondStep.value === 0;

    warning(isHourStepValid, `\`hourStep\` ${hourStep} is invalid. It should be a factor of 24.`);
    warning(isMinuteStepValid, `\`minuteStep\` ${minuteStep} is invalid. It should be a factor of 60.`);
    warning(isSecondStepValid, `\`secondStep\` ${secondStep} is invalid. It should be a factor of 60.`);
  }

  // ======================== Disabled ========================
  const getDisabledTimes = (targetDate: DateType) => {
    const disabledConfig = disabledTime?.value?.(targetDate) || {};
    return {
      mergedDisabledHours: disabledConfig.disabledHours || emptyDisabled,
      mergedDisabledMinutes: disabledConfig.disabledMinutes || emptyDisabled,
      mergedDisabledSeconds: disabledConfig.disabledSeconds || emptyDisabled,
      mergedDisabledMilliseconds: disabledConfig.disabledMilliseconds || emptyDisabled,
    } as const;
  };

  const { mergedDisabledHours, mergedDisabledMinutes, mergedDisabledSeconds, mergedDisabledMilliseconds } = toRefs(
    reactiveComputed(() => getDisabledTimes(mergedDate.value)),
  );

  // ========================= Column =========================
  const getAllUnits = (
    getDisabledHours: DisabledTimes['disabledHours'],
    getDisabledMinutes: DisabledTimes['disabledMinutes'],
    getDisabledSeconds: DisabledTimes['disabledSeconds'],
    getDisabledMilliseconds: DisabledTimes['disabledMilliseconds'],
  ) => {
    const hours = generateUnits(0, 23, hourStep.value, hideDisabledOptions.value, getDisabledHours());

    // Hours
    const rowHourUnits = use12Hours.value
      ? hours.map((unit) => ({
          ...unit,
          label: leftPad((unit.value as number) % 12 || 12, 2),
        }))
      : hours;

    // Minutes
    const getMinuteUnits = (nextHour: number) =>
      generateUnits(0, 59, minuteStep.value, hideDisabledOptions.value, getDisabledMinutes(nextHour));

    // Seconds
    const getSecondUnits = (nextHour: number, nextMinute: number) =>
      generateUnits(0, 59, secondStep.value, hideDisabledOptions.value, getDisabledSeconds(nextHour, nextMinute));

    // Milliseconds
    const getMillisecondUnits = (nextHour: number, nextMinute: number, nextSecond: number) =>
      generateUnits(
        0,
        999,
        millisecondStep.value,
        hideDisabledOptions.value,
        getDisabledMilliseconds(nextHour, nextMinute, nextSecond),
        3,
      );
    return {
      rowHourUnits,
      getMinuteUnits,
      getSecondUnits,
      getMillisecondUnits,
    } as const;
  };

  const { rowHourUnits, getMinuteUnits, getSecondUnits, getMillisecondUnits } = toRefs(
    reactiveComputed(() =>
      getAllUnits(
        mergedDisabledHours.value,
        mergedDisabledMinutes.value,
        mergedDisabledSeconds.value,
        mergedDisabledMilliseconds.value,
      ),
    ),
  );

  // ======================== Validate ========================
  /**
   * Get validate time with `disabledTime`, `certainDate` to specific the date need to check
   */
  const getValidTime = (nextTime: DateType, certainDate?: DateType) => {
    let getCheckHourUnits = () => rowHourUnits.value;
    let getCheckMinuteUnits = getMinuteUnits.value;
    let getCheckSecondUnits = getSecondUnits.value;
    let getCheckMillisecondUnits = getMillisecondUnits.value;

    if (certainDate) {
      const { mergedDisabledHours, mergedDisabledMinutes, mergedDisabledSeconds, mergedDisabledMilliseconds } =
        getDisabledTimes(certainDate);

      const { rowHourUnits, getMinuteUnits, getSecondUnits, getMillisecondUnits } = getAllUnits(
        mergedDisabledHours,
        mergedDisabledMinutes,
        mergedDisabledSeconds,
        mergedDisabledMilliseconds,
      );

      getCheckHourUnits = () => rowHourUnits;
      getCheckMinuteUnits = getMinuteUnits;
      getCheckSecondUnits = getSecondUnits;
      getCheckMillisecondUnits = getMillisecondUnits;
    }

    const validateDate = findValidateTime(
      nextTime,
      getCheckHourUnits,
      getCheckMinuteUnits,
      getCheckSecondUnits,
      getCheckMillisecondUnits,
      generateConfig.value,
    );

    return validateDate;
  };

  return [
    // getValidTime
    getValidTime,

    // Units
    rowHourUnits,
    getMinuteUnits,
    getSecondUnits,
    getMillisecondUnits,
  ] as const;
}
