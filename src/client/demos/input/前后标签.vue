<script lang="tsx" setup>
import { SettingOutlined } from '@ant-design/icons-vue';
import { Cascader, Input, Select, Space } from '@/components';
import { h } from 'vue';

const selectBefore = (
  <Select
    value="http://"
    options={[
      { value: 'http://', label: 'http://' },
      { value: 'https://', label: 'https://' },
    ]}
  ></Select>
);
const selectAfter = (
  <Select
    value=".com"
    options={[
      { value: '.com', label: '.com' },
      { value: '.jp', label: '.jp' },
      { value: '.cn', label: '.cn' },
      { value: '.org', label: '.org' },
    ]}
  ></Select>
);
</script>
<template>
  <Space orientation="vertical">
    <Input addon-before="http://" addon-after=".com" value="mysite" />
    <Input :addon-before="selectBefore" :addon-after="selectAfter" value="mysite" />
    <Input :addon-after="SettingOutlined" value="mysite" />
    <Input addon-before="http://" suffix=".com" value="mysite" />
    <Input :addon-before="h(Cascader, { placeholder: 'cascader', style: { width: '150px' } })" value="mysite" />
  </Space>
</template>
