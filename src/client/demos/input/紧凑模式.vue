<script lang="tsx" setup>
import { Button, Input, Select, Space } from '@/components';
import { SearchOutlined } from '@ant-design/icons-vue';

const { Search } = Input;

const options = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
  },
];
</script>
<template>
  <Space vertical size="middle">
    <Space.Compact>
      <Input value="26888888" />
    </Space.Compact>
    <Space.Compact>
      <Input :style="{ width: '20%' }" value="0571" />
      <Input :style="{ width: '80%' }" value="26888888" />
    </Space.Compact>
    <Space.Compact>
      <Search addon-before="https://" placeholder="input search text" allow-clear />
    </Space.Compact>
    <Space.Compact :style="{ width: '100%' }">
      <Input value="Combine input and button" />
      <Button type="primary">Submit</Button>
    </Space.Compact>
    <Space.Compact>
      <Select value="Zhejiang" :options="options" />
      <Input value="Xihu District, Hangzhou" />
    </Space.Compact>
    <Space.Compact size="large">
      <Input :addon-before="SearchOutlined" placeholder="large size" />
      <Input placeholder="another input" />
    </Space.Compact>
  </Space>
</template>
