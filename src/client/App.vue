<script lang="tsx" setup>
import { Space } from '@/components';
import Demo2 from './demos/auto-complete/基础使用.vue';
import Demo1 from './demos/cascader/基础.vue';
import Demo4 from './demos/checkbox/全选.vue';
import Demo5 from './demos/color-picker/基础使用.vue';
import Demo6 from './demos/date-picker/基本.vue';
import Demo7 from './demos/date-picker/范围选择器.vue';
import InputNumberDemo1 from './demos/input-number/前后标签.vue';
import InputNumberDemo2 from './demos/input-number/滚轮.vue';
import InputNumberDemo3 from './demos/input-number/高精度小数.vue';
import Demo10 from './demos/input/一次性密码框.vue';
import Demo8 from './demos/input/前后标签.vue';
import Demo9 from './demos/input/密码框.vue';
import MentionsDemo1 from './demos/mentions/基础使用.vue';
import RadioDemo1 from './demos/radio/单选组合.vue';
import RateDemo1 from './demos/rate/半星.vue';
import Demo3 from './demos/select/基础使用.vue';
import TimePickerDemo1 from './demos/time-picker/基本.vue';
import TimePickerDemo2 from './demos/time-picker/形态变体.vue';
import TransferDemo1 from './demos/transfer/树穿梭框.vue';
import TreeDemo1 from './demos/tree-select/多选.vue';
import UploadDemo1 from './demos/upload/点击上传.vue';
</script>
<template>
  <Space vertical class="!w-full">
    <Demo1 />
    <Demo2 />
    <Demo3 />
    <Demo4 />
    <Demo5 />
    <Demo6 />
    <Demo7 />
    <Demo8 />
    <Demo9 />
    <Demo10 />
    <InputNumberDemo1 />
    <InputNumberDemo2 />
    <InputNumberDemo3 />
    <RadioDemo1 />
    <MentionsDemo1 />
    <RateDemo1 />
    <TimePickerDemo1 />
    <TimePickerDemo2 />
    <TransferDemo1 />
    <TreeDemo1 />
    <UploadDemo1 />
  </Space>
</template>
