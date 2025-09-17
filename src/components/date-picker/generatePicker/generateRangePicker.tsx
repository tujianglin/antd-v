import type { GenerateConfig } from '@/vc-component/picker/generate';
import type { AnyObject } from '../../_util/type';
import RangePicker from '../RangePicker.vue';
import type { RangePickerProps } from './interface';

const generateRangePicker = <DateType extends AnyObject = AnyObject>(generateConfig: GenerateConfig<DateType>) => {
  type DateRangePickerProps = RangePickerProps<DateType>;
  return (props: DateRangePickerProps) => <RangePicker generateConfig={generateConfig} {...props}></RangePicker>;
};

export default generateRangePicker;
