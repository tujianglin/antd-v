<script lang="tsx" setup>
import { Select } from '@/components';

const handleChange = (value: { value: string; label }) => {
  console.log(value); // { value: "lucy", key: "lucy", label: "Lucy (101)" }
};
</script>
<template>
  <Select
    label-in-value
    :value="{ value: 'lucy', label: 'Lucy (101)' }"
    class="!w-30"
    @change="handleChange"
    :options="[
      {
        value: 'jack',
        label: 'Jack (100)',
      },
      {
        value: 'lucy',
        label: 'Lucy (101)',
      },
    ]"
  />
</template>
