<script lang="tsx" setup>
import { Button, Flex, Tooltip } from '@/components';
import { SearchOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <Flex gap="small" vertical>
    <Flex wrap gap="small">
      <Tooltip title="search">
        <Button type="primary" shape="circle" :icon="SearchOutlined" />
      </Tooltip>
      <Button type="primary" shape="circle"> A </Button>
      <Button type="primary" :icon="SearchOutlined"> Search </Button>
      <Tooltip title="search">
        <Button shape="circle" :icon="SearchOutlined" />
      </Tooltip>
      <Button :icon="SearchOutlined">Search</Button>
    </Flex>
    <Flex wrap gap="small">
      <Tooltip title="search">
        <Button shape="circle" :icon="SearchOutlined" />
      </Tooltip>
      <Button :icon="SearchOutlined">Search</Button>
      <Tooltip title="search">
        <Button type="dashed" shape="circle" :icon="SearchOutlined" />
      </Tooltip>
      <Button type="dashed" :icon="SearchOutlined"> Search </Button>
      <Button :icon="SearchOutlined" href="https://www.google.com" target="_blank" />
    </Flex>
  </Flex>
</template>
