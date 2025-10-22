<script lang="tsx" setup>
import { Input, Space } from '@/components';
import type { SearchProps } from '@/components/input';
import { AudioOutlined } from '@ant-design/icons-vue';

const { Search } = Input;

const suffix = (
  <AudioOutlined
    style={{
      fontSize: `${16}px`,
      color: '#1677ff',
    }}
  />
);

const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);
</script>
<template>
  <Space vertical>
    <Search placeholder="input search text" @search="onSearch" class="!w-50" />
    <Search placeholder="input search text" allow-clear @search="onSearch" class="!w-50" />
    <Search
      addon-before="https://"
      placeholder="input search text"
      allow-clear
      @search="onSearch"
      :style="{ width: `${304}px` }"
    />
    <Search placeholder="input search text" @search="onSearch" :enter-button="true" />
    <Search placeholder="input search text" allow-clear enter-button="Search" size="large" @search="onSearch" />
    <Search placeholder="input search text" enter-button="Search" size="large" :suffix="suffix" @search="onSearch" />
  </Space>
</template>
