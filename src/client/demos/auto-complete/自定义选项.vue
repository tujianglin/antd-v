<script lang="tsx" setup>
import type { AutoCompleteProps } from '@/components';
import { AutoComplete } from '@/components';
import { ref } from 'vue';

const options = ref<AutoCompleteProps['options']>([]);
const handleSearch = (value: string) => {
  if (!value || value.includes('@')) {
    options.value = [];
  }
  options.value = ['gmail.com', '163.com', 'qq.com'].map((domain) => ({
    label: `${value}@${domain}`,
    value: `${value}@${domain}`,
  }));
};
</script>
<template>
  <AutoComplete class="!w-50" placeholder="input here" :show-search="{ onSearch: handleSearch }" :options="options" />
</template>
