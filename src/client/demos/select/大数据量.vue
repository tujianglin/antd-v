<script lang="tsx" setup>
import { Select, type SelectProps } from '@/components';

const options: SelectProps['options'] = [];

for (let i = 0; i < 100000; i++) {
  const value = `${i.toString(36)}${i}`;
  options.push({
    label: value,
    value,
    disabled: i === 10,
  });
}
</script>
<template>
  <Select mode="multiple" class="!w-full" placeholder="Please select" :value="['a10', 'c12']" :options="options" />
</template>
