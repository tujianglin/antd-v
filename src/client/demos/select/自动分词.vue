<script lang="tsx" setup>
import { Select, type SelectProps } from '@/components';
const options: SelectProps['options'] = [];

for (let i = 10; i < 36; i++) {
  options.push({
    value: i.toString(36) + i,
    label: i.toString(36) + i,
  });
}

const handleChange = (value: string[]) => {
  console.log(`selected ${value}`);
};
</script>
<template>
  <Select mode="tags" class="!w-full" @change="handleChange" :token-separators="[',']" :options="options" />
</template>
