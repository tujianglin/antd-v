<script lang="tsx" setup>
import { Select, Space, type SelectProps } from '@/components';

const options: SelectProps['options'] = [];

for (let i = 10; i < 36; i++) {
  options.push({
    label: i.toString(36) + i,
    value: i.toString(36) + i,
  });
}

const handleChange = (value: string[]) => {
  console.log(`selected ${value}`);
};
</script>
<template>
  <Space class="!w-full" vertical>
    <Select
      mode="multiple"
      allow-clear
      class="!w-full"
      placeholder="Please select"
      :value="['a10', 'c12']"
      @change="handleChange"
      :options="options"
    />
    <Select
      mode="multiple"
      disabled
      class="!w-full"
      placeholder="Please select"
      :value="['a10', 'c12']"
      @change="handleChange"
      :options="options"
    />
  </Space>
</template>
