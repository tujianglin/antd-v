<script lang="tsx" setup>
import { Select } from '@/components';
</script>
<template>
  <Select
    :show-search="{ filterOption: (input, option) => ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase()) }"
    placeholder="Select a person"
    class="!w-30"
    :options="[
      { value: 'jack', label: 'Jack' },
      { value: 'lucy', label: 'Lucy' },
      { value: 'Yiminghe', label: 'yiminghe' },
      { value: 'disabled', label: 'Disabled', disabled: true },
    ]"
  />
</template>
