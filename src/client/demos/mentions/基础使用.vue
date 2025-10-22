<script lang="tsx" setup>
import { Mentions } from '@/components';
import type { MentionsOptionProps } from '@/components/mentions/index.vue';
import { ref } from 'vue';

const value = ref();

const onChange = (value: string) => {
  console.log('Change:', value);
};

const onSelect = (option: MentionsOptionProps) => {
  console.log('select', option);
};
</script>
<template>
  <Mentions
    class="!w-full"
    placeholder="1111"
    @change="onChange"
    @select="onSelect"
    v-model:value="value"
    :options="[
      {
        value: 'afc163',
        label: 'afc163',
      },
      {
        value: 'zombieJ',
        label: 'zombieJ',
      },
      {
        value: 'yesmeck',
        label: 'yesmeck',
      },
    ]"
  />
</template>
