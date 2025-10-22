import type { GenerateConfig } from '@/vc-component/picker/generate';
import type { ComponentInstance } from 'vue';
import RangePicker from '../RangePicker.vue';

const generateRangePicker = (generateConfig: GenerateConfig) => {
  type DateRangePickerProps = Partial<ComponentInstance<typeof RangePicker>['$props']>;

  return (props: DateRangePickerProps) => <RangePicker generateConfig={generateConfig} {...props}></RangePicker>;
};

export default generateRangePicker;
