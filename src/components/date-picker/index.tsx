import dayjsGenerateConfig from '@/vc-component/picker/generate/dayjs';
import type { Dayjs } from 'dayjs';
import generatePicker from './generatePicker';
import type { RangePickerProps as BaseRangePickerProps, PickerProps, PickerPropsWithMultiple } from './generatePicker/interface';
export type { PickerLocale, PickerProps } from './interface';

export type DatePickerProps<ValueType = Dayjs | Dayjs> = PickerPropsWithMultiple<Dayjs, PickerProps<Dayjs>, ValueType>;
export type MonthPickerProps<ValueType = Dayjs | Dayjs> = Omit<DatePickerProps<ValueType>, 'picker'>;
export type WeekPickerProps<ValueType = Dayjs | Dayjs> = Omit<DatePickerProps<ValueType>, 'picker'>;
export type RangePickerProps = BaseRangePickerProps<Dayjs>;

const DatePicker = generatePicker<Dayjs>(dayjsGenerateConfig);

export type DatePickerType = typeof DatePicker & {
  generatePicker: typeof generatePicker;
};

export default DatePicker as DatePickerType;
