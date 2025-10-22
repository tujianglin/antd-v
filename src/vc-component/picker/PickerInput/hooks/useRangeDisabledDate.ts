import type { GenerateConfig } from '../../generate';
import type { DisabledDate, Locale } from '../../interface';
import { isSame } from '../../utils/dateUtil';
import { getFromDate } from '../../utils/miscUtil';
import type { RangeValueType } from '../RangePicker.vue';

/**
 * RangePicker need additional logic to handle the `disabled` case. e.g.
 * [disabled, enabled] should end date not before start date
 */
export default function useRangeDisabledDate(
  values: RangeValueType,
  disabled: [boolean, boolean],
  activeIndexList: number[],
  generateConfig: GenerateConfig,
  locale: Locale,
  disabledDate?: DisabledDate,
) {
  const activeIndex = activeIndexList[activeIndexList.length - 1];

  const rangeDisabledDate: DisabledDate = (date, info) => {
    const [start, end] = values;

    const mergedInfo = {
      ...info,
      from: getFromDate(values, activeIndexList),
    };

    // ============================ Disabled ============================
    // Should not select days before the start date
    if (
      activeIndex === 1 &&
      disabled[0] &&
      start &&
      // Same date isOK
      !isSame(generateConfig, locale, start, date, mergedInfo.type) &&
      // Before start date
      generateConfig.isAfter(start, date)
    ) {
      return true;
    }

    // Should not select days after the end date
    if (
      activeIndex === 0 &&
      disabled[1] &&
      end &&
      // Same date isOK
      !isSame(generateConfig, locale, end, date, mergedInfo.type) &&
      // After end date
      generateConfig.isAfter(date, end)
    ) {
      return true;
    }
    // ============================= Origin =============================
    return disabledDate?.(date, mergedInfo);
  };

  return rangeDisabledDate;
}
