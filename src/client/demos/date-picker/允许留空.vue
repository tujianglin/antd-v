<script lang="tsx" setup>
import { DatePicker } from '@/components';
</script>
<template>
  <DatePicker.RangePicker
    :placeholder="['Start Date', 'Till Now']"
    :allow-empty="[false, true]"
    @change="
      (date, dateString) => {
        console.log(date, dateString);
      }
    "
  />
</template>
