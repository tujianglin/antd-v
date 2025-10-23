<script lang="tsx" setup>
import { Calendar, theme, type CalendarProps } from '@/components';
import type { Dayjs } from 'dayjs';
import type { CSSProperties } from 'vue';

const { token } = theme.useToken();

const wrapperStyle: CSSProperties = {
  width: `${300}px`,
  border: `1px solid ${token.value.colorBorderSecondary}`,
  borderRadius: token.value.borderRadiusLG,
};

const onPanelChange = (value: Dayjs, mode: CalendarProps['mode']) => {
  console.log(value.format('YYYY-MM-DD'), mode);
};
</script>
<template>
  <div :style="wrapperStyle">
    <Calendar :fullscreen="false" @panel-change="onPanelChange" />
  </div>
</template>
