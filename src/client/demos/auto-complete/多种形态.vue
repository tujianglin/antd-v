<script lang="tsx" setup>
import type { AutoCompleteProps } from '@/components';
import { AutoComplete, Flex } from '@/components';
import { ref } from 'vue';

const mockVal = (str: string, repeat = 1) => ({
  value: str.repeat(repeat),
});

const options = ref<AutoCompleteProps['options']>([]);

const getPanelValue = (searchText: string) =>
  !searchText ? [] : [mockVal(searchText), mockVal(searchText, 2), mockVal(searchText, 3)];
</script>
<template>
  <Flex vertical :gap="12">
    <AutoComplete
      :options="options"
      class="!w-50"
      placeholder="Outlined"
      :show-search="{ onSearch: (text) => (options = getPanelValue(text)) }"
    />
    <AutoComplete
      :options="options"
      class="!w-50"
      placeholder="Filled"
      :show-search="{ onSearch: (text) => (options = getPanelValue(text)) }"
      variant="filled"
    />
    <AutoComplete
      :options="options"
      class="!w-50"
      placeholder="Borderless"
      :show-search="{ onSearch: (text) => (options = getPanelValue(text)) }"
      variant="borderless"
    />
  </Flex>
</template>
