import type { GenerateConfig } from '@/vc-component/picker/generate';
import type { AnyObject } from '../_util/type';
import CalendarPanel, { type CalendarProps } from './CalendarPanel.vue';

const generateCalendar = <DateType extends AnyObject>(generateConfig: GenerateConfig<DateType>) => {
  const Calendar = (props: CalendarProps) => {
    return <CalendarPanel generateConfig={generateConfig} {...props}></CalendarPanel>;
  };

  return Calendar;
};

export default generateCalendar;
