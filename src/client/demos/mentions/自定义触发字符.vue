<script lang="tsx" setup>
import { Mentions, type MentionsProps } from '@/components';
import { ref } from 'vue';

const MOCK_DATA = {
  '@': ['afc163', 'zombiej', 'yesmeck'],
  '#': ['1.0', '2.0', '3.0'],
};

type PrefixType = keyof typeof MOCK_DATA;

const prefix = ref<PrefixType>('@');

const onSearch: MentionsProps['onSearch'] = (_, newPrefix) => {
  prefix.value = newPrefix as PrefixType;
};
</script>
<template>
  <Mentions
    class="!w-full"
    placeholder="input @ to mention people, # to mention tag"
    :prefix="['@', '#']"
    @search="onSearch"
    :options="
      (MOCK_DATA[prefix] || []).map((value) => ({
        key: value,
        value,
        label: value,
      }))
    "
  />
</template>
