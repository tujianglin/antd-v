<script lang="tsx" setup>
import { Select } from '@/components';

const handleChange = (value: string) => {
  console.log(`selected ${value}`);
};

const onSearch = (value: string) => {
  console.log('search:', value);
};
</script>
<template>
  <Select
    :show-search="{ optionFilterProp: 'label', onSearch }"
    value="lucy"
    class="!w-30"
    @change="handleChange"
    :options="[
      { value: 'jack', label: 'Jack' },
      { value: 'lucy', label: 'Lucy' },
      { value: 'Yiminghe', label: 'yiminghe' },
      { value: 'disabled', label: 'Disabled', disabled: true },
    ]"
  />
</template>
