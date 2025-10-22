<script lang="tsx" setup>
import { Select, Space } from '@/components';

const options = [
  {
    label: 'China',
    value: 'china',
    emoji: '🇨🇳',
    desc: 'China (中国)',
  },
  {
    label: 'USA',
    value: 'usa',
    emoji: '🇺🇸',
    desc: 'USA (美国)',
  },
  {
    label: 'Japan',
    value: 'japan',
    emoji: '🇯🇵',
    desc: 'Japan (日本)',
  },
  {
    label: 'Korea',
    value: 'korea',
    emoji: '🇰🇷',
    desc: 'Korea (韩国)',
  },
];
const handleChange = (value: string[]) => {
  console.log(`selected ${value}`);
};

const optionRender = (option) => (
  <Space>
    <span role="img" aria-label={option.data.label}>
      {option.data.emoji}
    </span>
    {option.data.desc}
  </Space>
);
</script>
<template>
  <Select
    mode="multiple"
    class="!w-full"
    placeholder="select one country"
    :value="['china']"
    @change="handleChange"
    :options="options"
    :option-render="optionRender"
  />
</template>
