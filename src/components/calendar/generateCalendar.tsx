import type { GenerateConfig } from '@/vc-component/picker/generate';
import CalendarPanel, { type CalendarProps } from './CalendarPanel.vue';

const generateCalendar = (generateConfig: GenerateConfig) => {
  const Calendar = (props: CalendarProps) => {
    return <CalendarPanel generateConfig={generateConfig} {...props}></CalendarPanel>;
  };

  return Calendar;
};

export default generateCalendar;
