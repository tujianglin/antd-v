import type { Ref } from 'vue';
import type { GenerateConfig } from '../../generate';
import type { PanelMode, RangeTimeProps, SharedPickerProps, SharedTimeProps } from '../../interface';

/**
 * Check if provided date is valid for the `disabledDate` & `showTime.disabledTime`.
 */
export default function useInvalidate<DateType extends object = any>(
  generateConfig: Ref<GenerateConfig<DateType>>,
  picker: Ref<PanelMode>,
  disabledDate?: SharedPickerProps<DateType>['disabledDate'],
  showTime?: Ref<SharedTimeProps<DateType> | RangeTimeProps<DateType>>,
) {
  // Check disabled date
  const isInvalidate = (date: DateType, info?: { from?: DateType; activeIndex: number }) => {
    const outsideInfo = { type: picker.value, ...info };
    delete outsideInfo.activeIndex;
    if (
      // Date object is invalid
      !generateConfig?.value?.isValidate?.(date) ||
      // Date is disabled by `disabledDate`
      (disabledDate && disabledDate(date, outsideInfo))
    ) {
      return true;
    }

    if ((picker?.value === 'date' || picker?.value === 'time') && showTime?.value) {
      const range = info && info.activeIndex === 1 ? 'end' : 'start';
      const { disabledHours, disabledMinutes, disabledSeconds, disabledMilliseconds } =
        showTime?.value?.disabledTime?.(date, range, { from: outsideInfo.from }) || {};

      const mergedDisabledHours = disabledHours;
      const mergedDisabledMinutes = disabledMinutes;
      const mergedDisabledSeconds = disabledSeconds;

      const hour = generateConfig?.value?.getHour(date);
      const minute = generateConfig?.value?.getMinute(date);
      const second = generateConfig?.value?.getSecond(date);
      const millisecond = generateConfig?.value?.getMillisecond(date);

      if (mergedDisabledHours && mergedDisabledHours().includes(hour)) {
        return true;
      }

      if (mergedDisabledMinutes && mergedDisabledMinutes(hour).includes(minute)) {
        return true;
      }

      if (mergedDisabledSeconds && mergedDisabledSeconds(hour, minute).includes(second)) {
        return true;
      }

      if (disabledMilliseconds && disabledMilliseconds(hour, minute, second).includes(millisecond)) {
        return true;
      }
    }
    return false;
  };

  return isInvalidate;
}
