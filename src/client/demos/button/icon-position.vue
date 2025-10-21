<script lang="tsx" setup>
import { Button, Divider, Flex, Radio, Space, Tooltip } from '@/components';
import { SearchOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

const position = ref<'start' | 'end'>('start');
</script>
<template>
  <Space>
    <Radio.Group
      v-model:value="position"
      option-type="button"
      :options="[
        { label: 'start', value: 'start' },
        { label: 'end', value: 'end' },
      ]"
    />
  </Space>
  <Divider title-placement="start" plain> Preview </Divider>
  <Flex gap="small" vertical>
    <Flex wrap gap="small">
      <Tooltip title="search">
        <Button type="primary" shape="circle" :icon="SearchOutlined" />
      </Tooltip>
      <Button type="primary" shape="circle"> A </Button>
      <Button type="primary" :icon="SearchOutlined" :icon-position="position"> Search </Button>
      <Tooltip title="search">
        <Button shape="circle" :icon="SearchOutlined" />
      </Tooltip>
      <Button :icon="SearchOutlined" :icon-position="position"> Search </Button>
    </Flex>
    <Flex wrap gap="small">
      <Tooltip title="search">
        <Button shape="circle" :icon="SearchOutlined" />
      </Tooltip>
      <Button :icon="SearchOutlined" type="text" :icon-position="position"> Search </Button>
      <Tooltip title="search">
        <Button type="dashed" shape="circle" :icon="SearchOutlined" />
      </Tooltip>
      <Button type="dashed" :icon="SearchOutlined" :icon-position="position"> Search </Button>
      <Button :icon="SearchOutlined" href="https://www.google.com" target="_blank" :icon-position="position" />
      <Button type="primary" loading :icon-position="position"> Loading </Button>
    </Flex>
  </Flex>
</template>
