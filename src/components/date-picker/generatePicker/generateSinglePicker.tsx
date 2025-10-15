import type { GenerateConfig } from '@/vc-component/picker/generate/index';
import type { PickerMode } from '@/vc-component/picker/interface';
import type { ComponentInstance } from 'vue';
import type { AnyObject } from '../../_util/type';
import SinglePicker from '../SinglePicker.vue';
import { MONTH, MONTHPICKER, QUARTER, QUARTERPICKER, TIME, TIMEPICKER, WEEK, WEEKPICKER, YEAR, YEARPICKER } from './constant';

const generatePicker = <DateType extends AnyObject = AnyObject>(generateConfig: GenerateConfig<DateType>) => {
  type DatePickerProps = Partial<ComponentInstance<typeof SinglePicker>['$props']>;

  const getPicker = <P extends DatePickerProps>(picker?: PickerMode, displayName?: string) => {
    const pickerType = displayName === TIMEPICKER ? 'timePicker' : 'datePicker';

    const Picker = (props: P) => {
      return (
        <SinglePicker picker={picker} pickerType={pickerType} generateConfig={generateConfig as any} {...props}></SinglePicker>
      );
    };
    if (process.env.NODE_ENV !== 'production' && displayName) {
      Picker.displayName = displayName;
    }
    return Picker;
  };

  const DatePicker = getPicker<DatePickerProps>();
  const WeekPicker = getPicker<Omit<DatePickerProps, 'picker'>>(WEEK, WEEKPICKER);
  const MonthPicker = getPicker<Omit<DatePickerProps, 'picker'>>(MONTH, MONTHPICKER);
  const YearPicker = getPicker<Omit<DatePickerProps, 'picker'>>(YEAR, YEARPICKER);
  const QuarterPicker = getPicker<Omit<DatePickerProps, 'picker'>>(QUARTER, QUARTERPICKER);
  const TimePicker = getPicker<Omit<DatePickerProps, 'picker' | 'showTime'>>(TIME, TIMEPICKER);

  return { DatePicker, WeekPicker, MonthPicker, YearPicker, TimePicker, QuarterPicker };
};

export default generatePicker;
