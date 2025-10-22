import type { GenerateConfig } from '@/vc-component/picker/generate/index';

import generateRangePicker from './generateRangePicker';
import generateSinglePicker from './generateSinglePicker';

export type { PickerLocale, PickerProps } from './interface';

const generatePicker = (generateConfig: GenerateConfig) => {
  // =========================== Picker ===========================
  const { DatePicker, WeekPicker, MonthPicker, YearPicker, TimePicker, QuarterPicker } = generateSinglePicker(generateConfig);

  // ======================== Range Picker ========================
  const RangePicker = generateRangePicker(generateConfig);

  // =========================== Export ===========================
  type MergedDatePickerType = typeof DatePicker & {
    displayName?: string;
    WeekPicker: typeof WeekPicker;
    MonthPicker: typeof MonthPicker;
    YearPicker: typeof YearPicker;
    RangePicker: typeof RangePicker;
    TimePicker: typeof TimePicker;
    QuarterPicker: typeof QuarterPicker;
  };

  const MergedDatePicker = DatePicker as MergedDatePickerType;

  MergedDatePicker.WeekPicker = WeekPicker;
  MergedDatePicker.MonthPicker = MonthPicker;
  MergedDatePicker.YearPicker = YearPicker;
  MergedDatePicker.RangePicker = RangePicker;
  MergedDatePicker.TimePicker = TimePicker;
  MergedDatePicker.QuarterPicker = QuarterPicker;

  return MergedDatePicker;
};

export default generatePicker;
