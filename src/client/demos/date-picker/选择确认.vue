<script lang="tsx" setup>
import { DatePicker } from '@/components';

const onChange = (date, dateString) => {
  console.log(date, dateString);
};
</script>
<template>
  <DatePicker @change="onChange" need-confirm />
</template>
