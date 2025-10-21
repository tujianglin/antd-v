<script lang="tsx" setup>
import type { AutoCompleteProps } from '@/components';
import { AutoComplete } from '@/components';
import { ref } from 'vue';

const mockVal = (str: string, repeat = 1) => ({
  value: str.repeat(repeat),
});

const value = ref('');
const options = ref<AutoCompleteProps['options']>([]);
const anotherOptions = ref<AutoCompleteProps['options']>([]);

const getPanelValue = (searchText: string) =>
  !searchText ? [] : [mockVal(searchText), mockVal(searchText, 2), mockVal(searchText, 3)];
</script>
<template>
  <AutoComplete
    :options="options"
    class="!w-50"
    :show-search="{
      onSearch: (text) => (options = getPanelValue(text)),
    }"
    placeholder="input here"
  />
  <br />
  <br />
  <AutoComplete
    v-model:value="value"
    :show-search="{ onSearch: (text) => (anotherOptions = getPanelValue(text)) }"
    :options="anotherOptions"
    class="!w-50"
    placeholder="control mode"
  />
</template>
