<script lang="tsx" setup>
import { DatePicker, Space, theme, type DatePickerProps } from '@/components';
import type { CSSProperties } from 'vue';

const { RangePicker } = DatePicker;

const { token } = theme.useToken();
const style: CSSProperties = {
  border: `1px solid ${token.value.colorPrimary}`,
  borderRadius: '50%',
};
const cellRender: DatePickerProps['cellRender'] = (current, info) => {
  if (info.type !== 'date') {
    return info.originNode;
  }
  if (typeof current === 'number' || typeof current === 'string') {
    return <div class="ant-picker-cell-inner">{current}</div>;
  }
  return (
    <div class="ant-picker-cell-inner" style={current.date() === 1 ? style : {}}>
      {current.date()}
    </div>
  );
};
</script>
<template>
  <Space orientation="vertical" :size="12">
    <DatePicker :cell-render="cellRender" />
    <RangePicker :cell-render="cellRender" />
  </Space>
</template>
