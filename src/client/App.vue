<script setup lang="tsx">
import { AutoComplete, Input } from '@/components';
import { ref } from 'vue';

const getRandomInt = (max: number, min = 0) => Math.floor(Math.random() * (max - min + 1)) + min;

const searchResult = (query: string) =>
  Array.from({ length: getRandomInt(5) })
    .join('.')
    .split('.')
    .map((_, idx) => {
      const category = `${query}${idx}`;
      return {
        value: category,
        label: () => (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              Found {query} on{' '}
              <a href={`https://s.taobao.com/search?q=${query}`} target="_blank" rel="noopener noreferrer">
                {category}
              </a>
            </span>
            <span>{getRandomInt(200, 100)} results</span>
          </div>
        ),
      };
    });

const options = ref<any[]>([]);

const handleSearch = (value: string) => {
  options.value = value ? searchResult(value) : [];
  console.log(options.value);
};

const onSelect = (value: string) => {
  console.log('onSelect', value);
};
</script>

<template>
  <AutoComplete
    :popup-match-select-width="252"
    :style="{ width: '300px' }"
    :options="options"
    @select="onSelect"
    :show-search="{ onSearch: handleSearch }"
  >
    <Input.Search size="large" placeholder="input here" :enter-button="true" />
  </AutoComplete>
</template>
