import type { DateType } from '@/vc-util/type';
import type { Ref } from 'vue';
import type { GenerateConfig } from '../../generate';
import type { DisabledDate, InternalMode, Locale } from '../../interface';
import { isSame } from '../../utils/dateUtil';

export type IsInvalidBoundary = (currentDate: DateType, type: InternalMode, fromDate?: DateType) => boolean;

/**
 * Merge `disabledDate` with `minDate` & `maxDate`.
 */
export default function useDisabledBoundary(
  generateConfig: Ref<GenerateConfig>,
  locale: Ref<Locale>,
  disabledDate?: Ref<DisabledDate>,
  minDate?: Ref<DateType>,
  maxDate?: Ref<DateType>,
) {
  const mergedDisabledDate = <DisabledDate>((date, info) => {
    if (disabledDate?.value && disabledDate?.value(date, info)) {
      return true;
    }

    if (
      minDate?.value &&
      generateConfig?.value.isAfter(minDate?.value, date) &&
      !isSame(generateConfig?.value, locale?.value, minDate?.value, date, info.type)
    ) {
      return true;
    }

    if (
      maxDate?.value &&
      generateConfig?.value.isAfter(date, maxDate?.value) &&
      !isSame(generateConfig?.value, locale?.value, maxDate?.value, date, info.type)
    ) {
      return true;
    }

    return false;
  });

  return mergedDisabledDate;
}
