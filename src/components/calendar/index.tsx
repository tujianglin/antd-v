import dayjsGenerateConfig from '@/vc-component/picker/generate/dayjs';
import type { CalendarMode, CalendarProps } from './CalendarPanel.vue';
import generateCalendar from './generateCalendar';

const Calendar = generateCalendar(dayjsGenerateConfig);

export type { CalendarMode, CalendarProps };

export default Calendar;
