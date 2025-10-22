<script lang="tsx" setup>
import { DatePicker, Space } from '@/components';
import { SmileOutlined } from '@ant-design/icons-vue';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

const smileIcon = <SmileOutlined />;

const onChange = (date: Dayjs | (Dayjs | null)[] | null, dateString: string | string[]) => {
  console.log(date, dateString);
};
</script>
<template>
  <Space orientation="vertical" :size="12">
    <DatePicker :suffix-icon="smileIcon" @change="onChange" />
    <DatePicker :suffix-icon="smileIcon" @change="onChange" picker="month" />
    <RangePicker :suffix-icon="smileIcon" @change="onChange" />
    <DatePicker :suffix-icon="smileIcon" @change="onChange" picker="week" />
    <DatePicker suffix-icon="ab" @change="onChange" />
    <DatePicker suffix-icon="ab" @change="onChange" picker="month" />
    <RangePicker suffix-icon="ab" @change="onChange" />
    <DatePicker suffix-icon="ab" @change="onChange" picker="week" />
    <DatePicker :prefix="smileIcon" @change="onChange" picker="week" />
    <DatePicker prefix="Event Period" @change="onChange" picker="week" />
    <RangePicker :prefix="smileIcon" @change="onChange" picker="week" />
    <RangePicker prefix="Event Period" @change="onChange" picker="week" />
  </Space>
</template>
