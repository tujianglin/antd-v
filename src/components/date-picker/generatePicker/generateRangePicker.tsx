import type { GenerateConfig } from '@/vc-component/picker/generate';
import type { ComponentInstance } from 'vue';
import type { AnyObject } from '../../_util/type';
import RangePicker from '../RangePicker.vue';

const generateRangePicker = <DateType extends AnyObject = AnyObject>(generateConfig: GenerateConfig<DateType>) => {
  type DateRangePickerProps = Partial<ComponentInstance<typeof RangePicker>['$props']>;
  return (props: DateRangePickerProps) => <RangePicker generateConfig={generateConfig as any} {...props}></RangePicker>;
};

export default generateRangePicker;
