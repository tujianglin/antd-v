import InternalTimePicker from './index.vue';
import RangePicker from './RangePicker.vue';

export type { TimePickerProps, TimeRangePickerProps } from './index.vue';

const TimePicker = InternalTimePicker as typeof InternalTimePicker & {
  RangePicker: typeof RangePicker;
};

TimePicker.RangePicker = RangePicker;

export default TimePicker;
