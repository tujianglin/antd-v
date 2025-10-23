<script lang="tsx" setup>
import { Segmented } from '@/components';
</script>
<template>
  <Segmented
    :options="['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']"
    @change="
      (value) => {
        console.log(value); // string
      }
    "
  />
</template>
