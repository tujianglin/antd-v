import dayjsGenerateConfig from '@/vc-component/picker/generate/dayjs';
import generatePicker from './generatePicker';
import type { RangePickerProps as BaseRangePickerProps, PickerPropsWithMultiple } from './generatePicker/interface';
export type { PickerLocale, PickerProps } from './interface';

export type DatePickerProps = PickerPropsWithMultiple;
export type MonthPickerProps = Omit<DatePickerProps, 'picker'>;
export type WeekPickerProps = Omit<DatePickerProps, 'picker'>;
export type RangePickerProps = BaseRangePickerProps;

const DatePicker = generatePicker(dayjsGenerateConfig);

export type DatePickerType = typeof DatePicker & {
  generatePicker: typeof generatePicker;
};

export default DatePicker as DatePickerType;
