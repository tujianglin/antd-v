<script lang="tsx" setup>
import { Select } from '@/components';
import { DownOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

const MAX_COUNT = 3;

const value = ref<string[]>(['Ava Swift']);

const suffix = () => (
  <>
    <span>
      {value.value.length} / {MAX_COUNT}
    </span>
    <DownOutlined />
  </>
);
</script>
<template>
  <Select
    mode="multiple"
    :max-count="MAX_COUNT"
    v-model:value="value"
    class="!w-full"
    :suffix-icon="suffix"
    placeholder="Please select"
    :options="[
      { value: 'Ava Swift', label: 'Ava Swift' },
      { value: 'Cole Reed', label: 'Cole Reed' },
      { value: 'Mia Blake', label: 'Mia Blake' },
      { value: 'Jake Stone', label: 'Jake Stone' },
      { value: 'Lily Lane', label: 'Lily Lane' },
      { value: 'Ryan Chase', label: 'Ryan Chase' },
      { value: 'Zoe Fox', label: 'Zoe Fox' },
      { value: 'Alex Grey', label: 'Alex Grey' },
      { value: 'Elle Blair', label: 'Elle Blair' },
    ]"
  />
</template>
