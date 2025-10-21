<script lang="tsx" setup>
import type { AutoCompleteProps } from '@/components';
import { AutoComplete, Input } from '@/components';
import { ref } from 'vue';
const { TextArea } = Input;

const options = ref<AutoCompleteProps['options']>([]);

const handleSearch = (value: string) => {
  options.value = !value ? [] : [{ value }, { value: value + value }, { value: value + value + value }];
};

const handleKeyPress = (ev: KeyboardEvent) => {
  console.log('handleKeyPress', ev);
};
</script>
<template>
  <AutoComplete :options="options" class="!w-50" :show-search="{ onSearch: handleSearch }">
    <TextArea placeholder="input here" class="custom" style="height: 50px" @keypress="handleKeyPress" />
  </AutoComplete>
</template>
