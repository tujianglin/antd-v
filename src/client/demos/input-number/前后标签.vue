<script lang="tsx" setup>
import { SettingOutlined } from '@ant-design/icons-vue';
import { Cascader, InputNumber, Select, Space } from '@/components';
import { h } from 'vue';

const selectBefore = () => (
  <Select
    value="add"
    style={{ width: `${60}px` }}
    options={[
      { label: '+', value: 'add' },
      { label: '-', value: 'minus' },
    ]}
  ></Select>
);
const selectAfter = () => (
  <Select
    value="USD"
    style={{ width: `${60}px` }}
    options={[
      { value: 'USD', label: '$' },
      { value: 'EUR', label: '€' },
      { value: 'GBP', label: '£' },
      { value: 'CNY', label: '¥' },
    ]}
  ></Select>
);
</script>
<template>
  <Space orientation="vertical">
    <InputNumber addon-before="+" addon-after="$" :value="100" />
    <InputNumber :addon-before="selectBefore" :addon-after="selectAfter" :value="100" />
    <InputNumber :addon-after="SettingOutlined" :value="100" />
    <InputNumber
      :addon-before="
        h(Cascader, {
          placeholder: 'cascader',
          style: {
            width: `${150}px`,
          },
        })
      "
      :value="100"
    />
    <InputNumber addon-before="+" :addon-after="SettingOutlined" :value="100" disabled controls />
    <InputNumber prefix="¥" addon-before="+" :addon-after="SettingOutlined" :value="100" disabled controls />
  </Space>
</template>
