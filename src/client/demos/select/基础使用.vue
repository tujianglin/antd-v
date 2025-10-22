<script lang="tsx" setup>
import { Select, Space } from '@/components';

const handleChange = (value: string) => {
  console.log(`selected ${value}`);
};
</script>
<template>
  <Space wrap>
    <Select
      value="lucy"
      class="!w-30"
      @change="handleChange"
      :options="[
        { value: 'jack', label: 'Jack' },
        { value: 'lucy', label: 'Lucy' },
        { value: 'Yiminghe', label: 'yiminghe' },
        { value: 'disabled', label: 'Disabled', disabled: true },
      ]"
    />
    <Select value="lucy" class="!w-30" disabled :options="[{ value: 'lucy', label: 'Lucy' }]" />
    <Select value="lucy" class="!w-30" loading :options="[{ value: 'lucy', label: 'Lucy' }]" />
    <Select value="lucy" class="!w-30" allow-clear :options="[{ value: 'lucy', label: 'Lucy' }]" placeholder="select it" />
  </Space>
</template>
