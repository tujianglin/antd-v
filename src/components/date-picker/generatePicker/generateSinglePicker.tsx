import type { GenerateConfig } from '@/vc-component/picker/generate/index';
import type { PickerMode } from '@/vc-component/picker/interface';
import type { VNode } from 'vue';
import type { AnyObject } from '../../_util/type';
import SinglePicker from '../SinglePicker.vue';
import { MONTH, MONTHPICKER, QUARTER, QUARTERPICKER, TIME, TIMEPICKER, WEEK, WEEKPICKER, YEAR, YEARPICKER } from './constant';
import type { GenericTimePickerProps, PickerProps, PickerPropsWithMultiple } from './interface';

const generatePicker = <DateType extends AnyObject = AnyObject>(generateConfig: GenerateConfig<DateType>) => {
  type DatePickerProps = PickerProps<DateType>;

  type TimePickerProps = GenericTimePickerProps<DateType>;

  const getPicker = <P extends DatePickerProps>(picker?: PickerMode, displayName?: string) => {
    const pickerType = displayName === TIMEPICKER ? 'timePicker' : 'datePicker';

    const Picker = (props: P) => {
      return <SinglePicker picker={picker} pickerType={pickerType} generateConfig={generateConfig} {...props}></SinglePicker>;
    };
    if (process.env.NODE_ENV !== 'production' && displayName) {
      Picker.displayName = displayName;
    }
    return Picker as unknown as (<ValueType = DateType>(props: PickerPropsWithMultiple<DateType, P, ValueType>) => VNode) & {
      displayName?: string;
    };
  };

  const DatePicker = getPicker<DatePickerProps>();
  const WeekPicker = getPicker<Omit<DatePickerProps, 'picker'>>(WEEK, WEEKPICKER);
  const MonthPicker = getPicker<Omit<DatePickerProps, 'picker'>>(MONTH, MONTHPICKER);
  const YearPicker = getPicker<Omit<DatePickerProps, 'picker'>>(YEAR, YEARPICKER);
  const QuarterPicker = getPicker<Omit<DatePickerProps, 'picker'>>(QUARTER, QUARTERPICKER);
  const TimePicker = getPicker<Omit<TimePickerProps, 'picker'>>(TIME, TIMEPICKER);

  return { DatePicker, WeekPicker, MonthPicker, YearPicker, TimePicker, QuarterPicker };
};

export default generatePicker;
