<script lang="tsx" setup>
import { Select, Space, Tooltip, type SelectProps } from '@/components';
import { ref } from 'vue';

interface ItemProps {
  label: string;
  value: string;
}

const options: ItemProps[] = [];

for (let i = 10; i < 36; i++) {
  const value = i.toString(36) + i;
  options.push({
    label: `Long Label: ${value}`,
    value,
  });
}

const sharedProps: SelectProps = {
  mode: 'multiple',
  style: { width: '100%' },
  options,
  placeholder: 'Select Item...',
  maxTagCount: 'responsive',
};
const maxTagPlaceholder = (omittedValues) => (
  <Tooltip styles={{ root: { pointerEvents: 'none' } }} title={omittedValues.map(({ label }) => label).join(', ')}>
    <span>Hover Me</span>
  </Tooltip>
);

const value = ref(['a10', 'c12', 'h17', 'j19', 'k20']);
</script>
<template>
  <Space vertical class="!w-full">
    <Select v-bind="{ ...sharedProps }" v-model:value="value" />
    <Select v-bind="sharedProps" disabled />
    <Select v-bind="{ ...sharedProps }" v-model:value="value" :max-tag-placeholder="maxTagPlaceholder" />
  </Space>
</template>
