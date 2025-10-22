<script lang="tsx" setup>
import type { TransferProps } from '@/components';
import { Transfer } from '@/components';
import { ref } from 'vue';

interface RecordType {
  key: string;
  title: string;
  description: string;
}

const mockData = Array.from({ length: 20 }).map<RecordType>((_, i) => ({
  key: i.toString(),
  title: `content${i + 1}`,
  description: `description of content${i + 1}`,
}));

const initialTargetKeys = mockData.filter((item) => Number(item.key) > 10).map((item) => item.key);

const targetKeys = ref(initialTargetKeys);

const filterOption = (inputValue: string, option: RecordType) => option.description.indexOf(inputValue) > -1;
const onChange: TransferProps['onChange'] = (nextTargetKeys, direction, moveKeys) => {
  console.log('targetKeys:', nextTargetKeys);
  console.log('direction:', direction);
  console.log('moveKeys:', moveKeys);
};

const handleSearch: TransferProps['onSearch'] = (dir, value) => {
  console.log('search:', dir, value);
};
</script>
<template>
  <Transfer
    show-search
    :data-source="mockData"
    :titles="['Source', 'Target']"
    v-model:target-keys="targetKeys"
    :filter-option="filterOption"
    @change="onChange"
    @search="handleSearch"
    :render="(item) => item.title"
  />
</template>
