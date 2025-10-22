<script lang="tsx" setup>
import type { RadioChangeEvent } from '@/components';
import { Input, Radio } from '@/components';
import { computed, ref } from 'vue';

const value = ref(1);

const onChange = (e: RadioChangeEvent) => {
  console.log(e);
};

const options = computed(() => [
  { value: 1, label: 'Option A' },
  { value: 2, label: 'Option B' },
  { value: 3, label: 'Option C' },
  {
    value: 4,
    label: (
      <>
        More...
        {value.value === 4 && (
          <Input variant="filled" placeholder="please input" style={{ width: '120px', marginInlineStart: `${12}px` }} />
        )}
      </>
    ),
  },
]);
</script>
<template>
  <Radio.Group vertical @change="onChange" v-model:value="value" :options="options" />
</template>
