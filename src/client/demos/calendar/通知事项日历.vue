<script lang="tsx" setup>
import { Badge, Calendar, type BadgeProps, type CalendarProps } from '@/components';
import type { Dayjs } from 'dayjs';

const getListData = (value: Dayjs) => {
  let listData: { type: string; content: string }[] = []; // Specify the type of listData
  switch (value.date()) {
    case 8:
      listData = [
        { type: 'warning', content: 'This is warning event.' },
        { type: 'success', content: 'This is usual event.' },
      ];
      break;
    case 10:
      listData = [
        { type: 'warning', content: 'This is warning event.' },
        { type: 'success', content: 'This is usual event.' },
        { type: 'error', content: 'This is error event.' },
      ];
      break;
    case 15:
      listData = [
        { type: 'warning', content: 'This is warning event' },
        { type: 'success', content: 'This is very long usual event......' },
        { type: 'error', content: 'This is error event 1.' },
        { type: 'error', content: 'This is error event 2.' },
        { type: 'error', content: 'This is error event 3.' },
        { type: 'error', content: 'This is error event 4.' },
      ];
      break;
    default:
  }
  return listData || [];
};

const getMonthData = (value: Dayjs) => {
  if (value.month() === 8) {
    return 1394;
  }
};

const monthCellRender = (value: Dayjs) => {
  const num = getMonthData(value);
  return num ? (
    <div class="notes-month">
      <section>{num}</section>
      <span>Backlog number</span>
    </div>
  ) : null;
};

const dateCellRender = (value: Dayjs) => {
  const listData = getListData(value);
  return (
    <ul class="events">
      {listData.map((item) => (
        <li key={item.content}>
          <Badge status={item.type as BadgeProps['status']} text={item.content} />
        </li>
      ))}
    </ul>
  );
};

const cellRender: CalendarProps['cellRender'] = (current, info) => {
  if (info.type === 'date') return dateCellRender(current);
  if (info.type === 'month') return monthCellRender(current);
  return info.originNode;
};
</script>
<template>
  <Calendar :cell-render="cellRender" />
</template>
