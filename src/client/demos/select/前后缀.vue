<script lang="tsx" setup>
import { Select, Space } from '@/components';
import { MehOutlined, SmileOutlined } from '@ant-design/icons-vue';
const smileIcon = <SmileOutlined />;
const mehIcon = <MehOutlined />;

const handleChange = (value: string | string[]) => {
  console.log(`selected ${value}`);
};
</script>
<template>
  <Space wrap>
    <Select
      prefix="User"
      value="lucy"
      class="!w-50"
      @change="handleChange"
      :options="[
        { value: 'jack', label: 'Jack' },
        { value: 'lucy', label: 'Lucy' },
        { value: 'Yiminghe', label: 'yiminghe' },
        { value: 'disabled', label: 'Disabled', disabled: true },
      ]"
    />
    <Select
      :suffix-icon="smileIcon"
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
    <Select :suffix-icon="mehIcon" value="lucy" class="!w-30" disabled :options="[{ value: 'lucy', label: 'Lucy' }]" />
    <br />
    <Select
      prefix="User"
      :value="['lucy']"
      mode="multiple"
      class="!w-50"
      @change="handleChange"
      :options="[
        { value: 'jack', label: 'Jack' },
        { value: 'lucy', label: 'Lucy' },
        { value: 'Yiminghe', label: 'yiminghe' },
        { value: 'disabled', label: 'Disabled', disabled: true },
      ]"
    />
    <Select
      :suffix-icon="smileIcon"
      :value="['lucy']"
      mode="multiple"
      class="!w-30"
      @change="handleChange"
      :options="[
        { value: 'jack', label: 'Jack' },
        { value: 'lucy', label: 'Lucy' },
        { value: 'Yiminghe', label: 'yiminghe' },
        { value: 'disabled', label: 'Disabled', disabled: true },
      ]"
    />
    <Select
      :suffix-icon="mehIcon"
      :value="['lucy']"
      mode="multiple"
      class="!w-30"
      disabled
      :options="[{ value: 'lucy', label: 'Lucy' }]"
    />
  </Space>
</template>
