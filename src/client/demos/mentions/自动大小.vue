<script lang="tsx" setup>
import { Mentions } from '@/components';
</script>
<template>
  <Mentions
    auto-size
    class="!w-full"
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
