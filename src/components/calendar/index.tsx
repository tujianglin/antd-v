import dayjsGenerateConfig from '@/vc-component/picker/generate/dayjs';
import type { Dayjs } from 'dayjs';
import type { CalendarMode, CalendarProps } from './CalendarPanel.vue';
import generateCalendar from './generateCalendar';

const Calendar = generateCalendar<Dayjs>(dayjsGenerateConfig);

export type { CalendarMode, CalendarProps };

export default Calendar;
